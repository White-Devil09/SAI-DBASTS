from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import connect, Error
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fetch database connection parameters from .env
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = os.getenv("DB_PORT", "5432")


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.get("/db-version")
async def get_db_version():
    """Fetch PostgreSQL version."""
    cursor = None  
    conn = None
    try:
        # Connect to the PostgreSQL server
        conn = connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        # Create a cursor object
        cursor = conn.cursor()
        
        # Execute a simple SQL query
        cursor.execute("SELECT version();")
        
        # Fetch the result
        db_version = cursor.fetchone()
        
        return {"PostgreSQL Version": db_version[0]}
    
    except Error as e:
        # Return the error message if something goes wrong
        return {"error": str(e)}
    
    finally:
        # Ensure resources are closed
        if cursor:
            cursor.close()
        if conn:
            conn.close()
