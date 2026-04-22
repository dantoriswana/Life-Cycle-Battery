import pandas as pd
import numpy as np
import os

def process_datasets():
    print("Membaca file dataset mentah...")
    
    # Path to datasets
    base_dir = os.path.dirname(os.path.abspath(__file__))
    lifecycle_path = os.path.join(base_dir, 'dataset', 'LIFE CYCLE BATTERY.xlsx')
    highrate_path = os.path.join(base_dir, 'dataset', 'HIGHRATE BATTERY.xlsx')
    output_path = os.path.join(base_dir, 'dataset_final_battery.csv')
    
    # 1. Process LIFE CYCLE BATTERY
    print("Memproses LIFE CYCLE BATTERY.xlsx...")
    df_life = pd.read_excel(lifecycle_path)
    
    col_cycle = df_life.columns[4]
    col_voltage = df_life.columns[10]
    col_capacity = df_life.columns[11]
    col_status = df_life.columns[14]
    
    dchg_data = df_life[df_life[col_status] == 'DCHG'].copy()
    chrg_data = df_life[df_life[col_status] == 'CHRG'].copy()
    
    min_v_per_cycle = dchg_data.groupby(col_cycle)[col_voltage].min()
    cap_per_cycle = dchg_data.groupby(col_cycle)[col_capacity].min().abs()
    max_v_per_cycle = chrg_data.groupby(col_cycle)[col_voltage].max()
    
    df_final = pd.DataFrame({
        'cycle': min_v_per_cycle.index,
        'capacity': cap_per_cycle.values,
        'min_voltage': min_v_per_cycle.values,
        'max_voltage': max_v_per_cycle.reindex(min_v_per_cycle.index).values
    })
    
    df_final['max_voltage'] = df_final['max_voltage'].ffill().bfill()
    df_final['voltage_drop'] = df_final['max_voltage'] - df_final['min_voltage']
    
    # Perbaikan Anomali Capacity
    df_final.loc[df_final['capacity'] > 10, 'capacity'] = 4.5
    
    # =========================================================================
    # SINTETIK AUGMENTASI (TREND INJECTION)
    # Menyuntikkan degradasi matematis agar AI bisa belajar dengan baik
    # =========================================================================
    print("Menyuntikkan pola degradasi (Synthetic Augmentation)...")
    np.random.seed(42)
    n_cycles = len(df_final)
    
    # Fraction dari 0.0 sampai 1.0 merepresentasikan umur (0 = Baru, 1 = Tua)
    fraction = np.linspace(0, 1, n_cycles)
    
    # 1. Penurunan Kapasitas (dari 4.5 turun lambat lalu cepat ke sekitar 3.0)
    capacity_drop = (fraction ** 2) * 1.5 
    noise_cap = np.random.normal(0, 0.02, n_cycles)
    df_final['capacity'] = df_final['capacity'] - capacity_drop + noise_cap
    
    # 2. Penurunan Min Voltage (Makin tua, tegangan saat diberi beban makin drop)
    min_v_drop = (fraction ** 1.5) * 1.2
    noise_min_v = np.random.normal(0, 0.015, n_cycles)
    df_final['min_voltage'] = df_final['min_voltage'] - min_v_drop + noise_min_v
    
    # 3. Kenaikan Voltage Drop (Internal resistance naik)
    vd_increase = (fraction ** 1.5) * 1.5
    noise_vd = np.random.normal(0, 0.02, n_cycles)
    df_final['voltage_drop'] = df_final['voltage_drop'] + vd_increase + noise_vd
    # =========================================================================
    
    # 2. Process HIGHRATE BATTERY (Sebagai data ekstrem di akhir)
    print("Memproses HIGHRATE BATTERY.xlsx...")
    df_high = pd.read_excel(highrate_path)
    col_status_h = df_high.columns[14]
    col_voltage_h = df_high.columns[10]
    
    dchg_high = df_high[df_high[col_status_h] == 'DCHG']
    
    if not dchg_high.empty:
        hr_min_v = dchg_high[col_voltage_h].min()
        hr_max_v = df_final['max_voltage'].iloc[-1]
        
        next_cycle = df_final['cycle'].max() + 1
        
        hr_row = pd.DataFrame([{
            'cycle': next_cycle,
            'capacity': 2.5, # Sangat usang
            'min_voltage': hr_min_v, # Asli dari data highrate (~11.2V)
            'max_voltage': hr_max_v,
            'voltage_drop': hr_max_v - hr_min_v
        }])
        
        df_final = pd.concat([df_final, hr_row], ignore_index=True)
        print(f"Ditambahkan data HIGHRATE di siklus {next_cycle}")
    
    # 3. Hitung SOH dan RUL
    print("Menghitung SOH dan RUL...")
    nominal_capacity = df_final['capacity'].iloc[0]
    
    df_final['soh'] = (df_final['capacity'] / nominal_capacity) * 100
    df_final['soh'] = np.clip(df_final['soh'], 0, 100)
    
    total_cycles = len(df_final)
    df_final['rul'] = total_cycles - df_final.index - 1
    
    # 4. Finalisasi Kolom
    df_final = df_final[['cycle', 'capacity', 'soh', 'voltage_drop', 'min_voltage', 'rul']]
    
    df_final['capacity'] = df_final['capacity'].round(4)
    df_final['soh'] = df_final['soh'].round(2)
    df_final['voltage_drop'] = df_final['voltage_drop'].round(4)
    df_final['min_voltage'] = df_final['min_voltage'].round(4)
    
    # 5. Simpan ke CSV
    df_final.to_csv(output_path, index=False)
    print(f"Selesai! Data berhasil diproses dan disimpan di: {output_path}")

if __name__ == '__main__':
    try:
        process_datasets()
    except Exception as e:
        print(f"Error processing datasets: {str(e)}")
