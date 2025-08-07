from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class Config:
    # Database connection URL
    SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://HELLOKIDZZ\HP:root@localhost:1433/NFM?driver=ODBC+Driver+17+for+SQL+Server"

# SQLAlchemy engine
engine = create_engine(Config.SQLALCHEMY_DATABASE_URL)

# Session local for queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)





# import os
# from sqlalchemy.engine.url import URL
# from sqlalchemy import create_engine

# class Config:
#     SQLALCHEMY_DATABASE_URI = os.getenv(
#         "SQLALCHEMY_DATABASE_URI",
#         "mssql+pyodbc://AppUser:AppUser%40123@192.168.1.13:1433/ASMREPORTING?driver=ODBC+Driver+17+for+SQL+Server"
#         # "mssql+pyodbc://AppUser:AppUser%40123@host.docker.internal:1433/ASMREPORTING?driver=ODBC+Driver+17+for+SQL+Server"
#     )
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

# if __name__ == "__main__":
#     engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
#     try:
#         with engine.connect() as connection:
#             result = connection.execute("SELECT * FROM dbo.BatchMaterials")
#             for row in result:
#                 print(row)
#     except Exception as e:
#         print(f"Error: {e}")