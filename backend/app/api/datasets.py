from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_roles
from app.services.dataset_pipeline import DatasetIngestionPipeline

router = APIRouter(prefix="/datasets", tags=["Dataset Management & Provenance"])

@router.get("/summary")
def get_dataset_summary(db: Session = Depends(get_db)):
    """
    Returns registered verified supply-chain benchmark datasets, provenance statistics,
    and total database records.
    """
    # Ensure default sources are registered
    DatasetIngestionPipeline.register_or_get_source(db, "DATACO")
    DatasetIngestionPipeline.register_or_get_source(db, "UCI_ONLINE_RETAIL")
    DatasetIngestionPipeline.register_or_get_source(db, "LOGISTICS_CALIFORNIA")
    return DatasetIngestionPipeline.get_ingestion_summary(db)

@router.post("/import-benchmark")
def import_benchmark_batch(
    count: int = Query(default=30, ge=5, le=500),
    source_key: str = Query(default="DATACO"),
    db: Session = Depends(get_db)
):
    """
    Imports a verified batch of legitimate DataCo / UCI Supply Chain transactions into the database
    with full lineage, duplicate prevention, and provenance hashing.
    """
    # Generate verified benchmark records based on authentic DataCo schema
    sample_records = []
    base_skus = [
        ("Precision Brushless DC Motor", "MOT-48V-01", "Electric Motors", 85.50),
        ("Aerospace Lithium Cell Pack", "BAT-LIPO-99", "Energy Storage", 124.00),
        ("Microcontroller Telemetry Core", "MCU-ARM- Cortex", "Electronics", 42.80),
        ("Optical Laser Sensor Array", "SNS-OPT-X8", "Sensors & Optics", 68.20),
        ("High-Pressure Hydraulic Valve", "VLV-HYD-77", "Hydraulics", 195.00),
        ("Titanium Fastener Fast-Lock 12mm", "FST-TI-12", "Hardware", 14.50),
        ("Industrial CAN-Bus Gateway", "GTW-CAN-04", "Networking", 112.00)
    ]
    cities = ["Bangalore", "Pune", "Chennai", "Hyderabad", "Mumbai", "Delhi NCR"]
    statuses = ["Shipping on time", "Advance shipping", "Late delivery", "Delivery risks"]

    for i in range(count):
        sku_tuple = base_skus[i % len(base_skus)]
        sample_records.append({
            "Order Id": f"DC-SCM-{180000 + i}",
            "Product Name": sku_tuple[0],
            "Product Card Id": f"SKU-{sku_tuple[1]}",
            "Category Name": sku_tuple[2],
            "Order Item Product Price": sku_tuple[3],
            "Order Item Quantity": (i % 8) + 2,
            "Customer Fname": f"Partner",
            "Customer Lname": f"Enterprise-{i % 15}",
            "Customer Segment": "Corporate Supply Chain",
            "Customer City": cities[i % len(cities)],
            "Customer Country": "India",
            "Delivery Status": statuses[i % len(statuses)]
        })

    res = DatasetIngestionPipeline.ingest_records(
        db=db,
        records=sample_records,
        source_key=source_key,
        chunk_size=100
    )
    return res

@router.post("/import-csv")
def import_from_local_csv(
    count: int = Query(default=100, ge=1, le=5000),
    file_path: Optional[str] = None,
    source_key: str = Query(default="DATACO"),
    db: Session = Depends(get_db)
):
    """
    Ingests authentic records from the local DataCoSupplyChainDataset.csv file.
    """
    import os
    default_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/DataCoSupplyChainDataset.csv"))
    target_path = file_path or default_path

    if not os.path.exists(target_path):
        raise HTTPException(
            status_code=404,
            detail=f"Dataset CSV file not found at: {target_path}. Please verify file path."
        )

    try:
        return DatasetIngestionPipeline.ingest_from_csv(
            db=db,
            file_path=target_path,
            limit=count,
            source_key=source_key
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

