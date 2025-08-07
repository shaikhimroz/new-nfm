from flask import Blueprint, request, jsonify
from extensions import db
from models.kpi_material import KPIMaterial
from sqlalchemy import func, text
from datetime import datetime

kpi_calendar_bp = Blueprint("kpi_calendar", __name__)

@kpi_calendar_bp.route("/kpi_calendar", methods=["GET"])
def get_kpi_calendar():
    try:
        # Parse date range
        start_date_str = request.args.get("startDate")
        end_date_str = request.args.get("endDate")
        if not start_date_str or not end_date_str:
            return jsonify({"error": "Start date and end date are required"}), 400

        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        except Exception:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")

        # Query: Use raw SQL to match exactly with manual SQL query
        sql_query = """
        SELECT CAST(dbo.[BatchMaterials].[Batch Act Start] AS DATE) AS date, 
               sum(dbo.[BatchMaterials].[Actual Value Float]) AS total_actual, 
               count(distinct(dbo.[BatchMaterials].[Batch GUID])) AS batch_count, 
               count(distinct(dbo.[BatchMaterials].[Product Name])) AS product_count
        FROM dbo.[BatchMaterials]
        WHERE dbo.[BatchMaterials].[Batch Act Start] >= :start_date AND dbo.[BatchMaterials].[Batch Act Start] <= :end_date 
          AND lower(dbo.[BatchMaterials].[Product Name]) != 'not selected' 
        GROUP BY CAST(dbo.[BatchMaterials].[Batch Act Start] AS DATE) 
        ORDER BY CAST(dbo.[BatchMaterials].[Batch Act Start] AS DATE)
        """
        
        results = db.session.execute(text(sql_query), {"start_date": start_date, "end_date": end_date}).fetchall()

        # Debug: Print the SQL query and the results
        print("[DEBUG] /kpi_calendar SQL Query:", sql_query)
        print("[DEBUG] /kpi_calendar Results:", results)

        # DEBUG: Print all batch GUIDs and product names for 2025-06-03 (a date with data)
        debug_date = datetime(2025, 6, 3).date()
        debug_sql = """
        SELECT dbo.[BatchMaterials].[Batch GUID], dbo.[BatchMaterials].[Product Name]
        FROM dbo.[BatchMaterials]
        WHERE CAST(dbo.[BatchMaterials].[Batch Act Start] AS DATE) = :debug_date 
          AND lower(dbo.[BatchMaterials].[Product Name]) != 'not selected'
        """
        debug_rows = db.session.execute(text(debug_sql), {"debug_date": debug_date}).fetchall()
        backend_batch_guids = set(str(r[0]).strip().lower() for r in debug_rows if r[0])
        backend_product_names = set(str(r[1]).strip().lower() for r in debug_rows if r[1])
        
        # SQL data for 2025-06-03 (normalized - lowercase and stripped)
        sql_product_names = set([
            'fm ruminant 13%',
            'fm layer economey cr',
            'fm baladi egg maker',
            'fm baladi pigeon feed pellet',
            'pmx 100207 broiler grower',
            'fm maker 1 ddgs',
            'mumtaz mix-grain',
            'fm meat maker3 cr  new',
            'fm crushed corn',
            'fm layer peak mash',
            'pmx 100366 layer mash',
            'pmx 100302 camel',
            'rabbit feed pl100531-pl',
            'fm layer gro mash lm',
            'pmx 100331 ruminant',
            'pmx 100392  broiler fin hp',
            'fm layer starter l m cr',
            'fm layer mash 17%',
            'bran flushing',
            'fm mix grain max'
        ])
        
        # For now, we'll skip batch GUID comparison since we don't have the SQL GUIDs
        # sql_batch_guids = set([...])  # Add your SQL GUIDs here when available
        
        print(f'[DEBUG] Testing date: {debug_date}')
        print(f'[DEBUG] Backend batch GUIDs count: {len(backend_batch_guids)}')
        print(f'[DEBUG] Backend product names count: {len(backend_product_names)}')
        print(f'[DEBUG] SQL product names count: {len(sql_product_names)}')
        print('[DEBUG] Unique batch GUIDs (backend):', backend_batch_guids)
        print('[DEBUG] Unique product names (backend):', backend_product_names)
        print('[DEBUG] Product names in SQL but not in backend:', sql_product_names - backend_product_names)
        print('[DEBUG] Product names in backend but not in SQL:', backend_product_names - sql_product_names)
        
        # Check if counts match
        backend_product_count = len(backend_product_names)
        sql_product_count = len(sql_product_names)
        print(f'[DEBUG] Product count comparison - Backend: {backend_product_count}, SQL: {sql_product_count}, Match: {backend_product_count == sql_product_count}')

        data = [
            {
                "date": str(row.date),
                "total_actual_kg": float(row.total_actual or 0),
                "total_actual_ton": float(row.total_actual or 0) / 1000,
                "batch_count": int(row.batch_count),
                "product_count": int(row.product_count)
            }
            for row in results
        ]
        return jsonify(data), 200

    except Exception as e:
        import traceback
        print(f"Error in get_kpi_calendar: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500 