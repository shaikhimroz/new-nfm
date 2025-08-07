from flask import Blueprint, request, jsonify
from extensions import db
from models.kpi import KPI
from models.kpi_material import KPIMaterial
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
import os

kpi_bp = Blueprint("kpi", __name__)

# 🟢 **Route to Insert KPI Data**
@kpi_bp.route("/kpi", methods=["POST"])
def add_kpi():
    try:
        data = request.get_json()
        new_kpi = KPI(
            batch_guid=data.get("batch_guid"),
            batch_name=data.get("batch_name"),
            product_name=data.get("product_name"),
            batch_act_start=datetime.strptime(data.get("batch_act_start"), "%Y-%m-%d %H:%M:%S"),
        )
        db.session.add(new_kpi)
        db.session.commit()
        return jsonify({"message": "KPI added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# 🟢 **Route to Get All KPI Data**
from flask import request, jsonify
from sqlalchemy import func
from datetime import datetime

@kpi_bp.route("/kpi", methods=["GET"])
def get_kpis():
    try:
        # 1. Extract filters from query params
        start_date_str = request.args.get("startDate")
        end_date_str = request.args.get("endDate")
        batch_filters = request.args.getlist("batch")
        product_filters = request.args.getlist("product")
        material_filters = request.args.getlist("material")
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=300000, type=int)

        # 2. Parse date range
        date_filter = []
        if start_date_str and end_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
                end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
            except Exception:
                try:
                    start_date = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M:%S")
                    end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    start_date = datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                    end_date = datetime.strptime(end_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
            date_filter = [KPIMaterial.batch_act_start >= start_date, KPIMaterial.batch_act_start <= end_date]
            print(f"Filtering KPI data between {start_date} and {end_date}")

        # 3. Build query
        query = KPIMaterial.query
        if date_filter:
            query = query.filter(*date_filter)
        if batch_filters:
            query = query.filter(KPIMaterial.batch_name.in_(batch_filters))
        if product_filters:
            query = query.filter(KPIMaterial.product_name.in_(product_filters))
        if material_filters:
            query = query.filter(KPIMaterial.material_name.in_(material_filters))

        # 🚫 Exclude 'Not Selected' product entries (case-insensitive)
        query = query.filter(func.lower(KPIMaterial.product_name) != 'not selected')

        # 4. Order and paginate
        query = query.order_by(KPIMaterial.batch_act_start.desc())
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        materials = pagination.items
        print(f"Found {pagination.total} KPI records")

        # 5. Format response
        kpi_list = []
        for mat in materials:
            kpi_list.append({
                "Batch GUID": mat.batch_guid,
                "Batch Name": mat.batch_name,
                "Product Name": mat.product_name,
                "Batch Act Start": mat.batch_act_start.strftime("%Y-%m-%d %H:%M:%S") if mat.batch_act_start else None,
                "Batch Act End": mat.batch_act_end.strftime("%Y-%m-%d %H:%M:%S") if mat.batch_act_end else None,
                "Quantity": mat.quantity,
                "Material Name": mat.material_name,
                "Material Code": mat.material_code,
                "SetPoint Float": mat.setpoint_float,
                "Actual Value Float": mat.actual_value_float,
                "Source Server": mat.source_server,
                "ROOTGUID": mat.rootguid,
                "OrderId": mat.order_id,
                "Batch Transfer Time": mat.batch_transfer_time,
                "FormulaCategoryName": mat.formula_category_name
            })

        return jsonify({
            "data": kpi_list,
            "page": pagination.page,
            "pages": pagination.pages,
            "total": pagination.total
        }), 200

    except Exception as e:
        import traceback
        print(f"Error in get_kpis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# 🟢 **Route to Get Report Data (Daily, Weekly, Monthly)**
@kpi_bp.route("/reports", methods=["GET"])
def get_reports():
    try:
        # 1. Extract parameters
        start_date_str = request.args.get("startDate")
        end_date_str = request.args.get("endDate")
        report_type = request.args.get("reportType", default="daily")
        batch_filters = request.args.getlist("batch")
        product_filters = request.args.getlist("product")
        material_filters = request.args.getlist("material")
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=300000, type=int)

        # 2. Validate required dates
        if not start_date_str or not end_date_str:
            return jsonify({"error": "Start date and end date are required"}), 400

        # 3. Parse date inputs
        try:
            start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        except Exception:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M:%S")
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
            except Exception:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                end_date = datetime.strptime(end_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")

        print(f"Generating {report_type} report between {start_date} and {end_date}")

        # 4. Build query
        query = KPIMaterial.query.filter(
            KPIMaterial.batch_act_start >= start_date,
            KPIMaterial.batch_act_start <= end_date
        )
        if batch_filters:
            query = query.filter(KPIMaterial.batch_name.in_(batch_filters))
        if product_filters:
            query = query.filter(KPIMaterial.product_name.in_(product_filters))
        if material_filters:
            query = query.filter(KPIMaterial.material_name.in_(material_filters))

        # 🚫 Exclude 'Not Selected' products
        query = query.filter(func.lower(KPIMaterial.product_name) != 'not selected')

        # 5. Order and paginate
        query = query.order_by(KPIMaterial.batch_act_start.desc())
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        materials = pagination.items
        print(f"Found {pagination.total} records for report")

        # 6. Format response
        kpi_list = []
        for mat in materials:
            kpi_list.append({
                "Batch GUID": mat.batch_guid,
                "Batch Name": mat.batch_name,
                "Product Name": mat.product_name,
                "Batch Act Start": mat.batch_act_start.strftime("%Y-%m-%d %H:%M:%S") if mat.batch_act_start else None,
                "Batch Act End": mat.batch_act_end.strftime("%Y-%m-%d %H:%M:%S") if mat.batch_act_end else None,
                "Quantity": mat.quantity,
                "Material Name": mat.material_name,
                "Material Code": mat.material_code,
                "SetPoint Float": mat.setpoint_float,
                "Actual Value Float": mat.actual_value_float,
                "Source Server": mat.source_server,
                "ROOTGUID": mat.rootguid,
                "OrderId": mat.order_id,
                "Batch Transfer Time": mat.batch_transfer_time,
                "FormulaCategoryName": mat.formula_category_name
            })

        return jsonify({
            "data": kpi_list,
            "page": pagination.page,
            "pages": pagination.pages,
            "total": pagination.total,
            "reportType": report_type
        }), 200

    except Exception as e:
        import traceback
        print(f"Error in get_reports: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@kpi_bp.route("/kpi/csv-format-report", methods=["GET"])
def get_kpi_csv_format_report():
    try:
        # 1. Extract filters from query params
        start_date_str = request.args.get("startDate")
        end_date_str = request.args.get("endDate")
        batch_filters = request.args.getlist("batch")
        product_filters = request.args.getlist("product")
        material_filters = request.args.getlist("material")
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=300000, type=int)

        # 2. Parse dates
        if not start_date_str or not end_date_str:
            return jsonify({"error": "startDate and endDate are required"}), 400
        try:
            start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        except Exception:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M:%S")
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
            except Exception:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                end_date = datetime.strptime(end_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")

        # 3. Query with filters
        query = KPIMaterial.query.filter(
            KPIMaterial.batch_transfer_time >= start_date,
            KPIMaterial.batch_transfer_time <= end_date,
            func.lower(KPIMaterial.product_name) != 'not selected'
        )
        if batch_filters:
            query = query.filter(KPIMaterial.batch_name.in_(batch_filters))
        if product_filters:
            query = query.filter(KPIMaterial.product_name.in_(product_filters))
        if material_filters:
            query = query.filter(KPIMaterial.material_name.in_(material_filters))

        # 4. Order & paginate
        query = query.order_by(KPIMaterial.batch_transfer_time.desc())
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        materials = pagination.items

        # 5. Format output like your CSV
        report_data = []
        for mat in materials:
            report_data.append({
                "Batch GUID": mat.batch_guid,
                "Batch Name": mat.batch_name,
                "Product Name": mat.product_name,
                "Batch Act Start": mat.batch_act_start.strftime("%H:%M:%S") if mat.batch_act_start else None,
                "Batch Act End": mat.batch_act_end.strftime("%H:%M:%S") if mat.batch_act_end else None,
                "Quantity": mat.quantity,
                "Material Name": mat.material_name,
                "Material Code": mat.material_code,
                "SetPoint Float": mat.setpoint_float,
                "Actual Value Float": mat.actual_value_float,
                "Source Server": mat.source_server,
                "ROOTGUID": mat.rootguid,
                "OrderId": mat.order_id,
                "EventID": mat.id,
                "Batch Transfer Time": mat.batch_transfer_time.strftime("%Y-%m-%d %H:%M:%S") if mat.batch_transfer_time else None,
                "FormulaCategoryName": mat.formula_category_name
            })

        return jsonify({
            "data": report_data,
            "page": pagination.page,
            "pages": pagination.pages,
            "total": pagination.total
        }), 200

    except Exception as e:
        import traceback
        print(f"Error in get_kpi_csv_format_report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
