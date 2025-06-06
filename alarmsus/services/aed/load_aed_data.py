import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os

def load_aed_data():
    # Read the CSV file
    csv_path = os.path.join(os.path.dirname(__file__), 'aed_geocoded.csv')
    df = pd.read_csv(csv_path)
    
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        dbname="alarmsus",  # Replace with your database name
        user="postgres",    # Replace with your username
        password="QHCqhc200-100", # Replace with your password
        host="localhost",
        port="5432"
    )
    
    cursor = conn.cursor()
    
    # Create table if it doesn't exist (the SQL is already in database.sql, but just in case)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS aed (
        id serial primary key,
        postal_code varchar(255) not null,
        building_name varchar(255) not null,
        location_description varchar(255) not null,
        latitude float not null,
        longitude float not null
    )
    """)
    
    # Prepare data for insertion
    data = [
        (
            row['postal_code'],
            row['building_name'],
            row['location_description'],
            row['latitude'],
            row['longitude']
        )
        for _, row in df.iterrows()
    ]
    
    # Insert data using execute_values for better performance
    execute_values(
        cursor,
        """
        INSERT INTO aed (postal_code, building_name, location_description, latitude, longitude)
        VALUES %s
        """,
        data
    )
    
    # Commit the transaction and close the connection
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    load_aed_data() 