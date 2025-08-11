from __future__ import annotations

if __name__ == "__main__":
    import sys

    sys.path.append("./modules/")
from typing import List, Optional, Dict, Tuple, Callable
import xarray as xr
import os

from forecasting_data.urlgen_enums import NWMRun, NWMVar, NWMGeo, NWMMem
from forecasting_data.urlgen_builder import create_default_file_list, append_jsons
import numpy as np
import pickle
import pyproj
from functools import cache

from forecasting_data.forecast_datasets import load_dataset_from_json


if __name__ == "__main__":
    import time

    test_channel_routes = False
    if test_channel_routes:
        # Instead of forcing data, access the NWMVar.CHANNEL_RT
        # and inspect the data.

        # Load the list of routing files with one date
        routing_files = create_default_file_list(
            runinput=NWMRun.SHORT_RANGE,
            varinput=NWMVar.CHANNEL_RT,
            geoinput=NWMGeo.CONUS,
            start_date="202301010000",
            end_date="202301010000",
            fcst_cycle=[0],  # Only one cycle for testing
            lead_time=[1],  # Only one lead time for testing
        )
        # Append the .json suffix to the routing url to make it loadable
        routing_files = append_jsons(file_list=routing_files)
        # Get the first file for testing
        routing_file = routing_files[0]
        print(f"Routing file: {routing_file}")
        routing_test_cache_path = "./dist/routing_test_cache.pkl"
        try:
            with open(routing_test_cache_path, "rb") as f:
                routing_dataset = pickle.load(f)
            print(f"Loaded cached routing dataset from {routing_test_cache_path}")
        except FileNotFoundError:
            # Load the dataset
            routing_dataset = load_dataset_from_json(file_path=routing_file)
            print(f"Loaded routing dataset from {routing_file}")
            with open(routing_test_cache_path, "wb") as f:
                pickle.dump(routing_dataset, f)
            print(f"Cached routing dataset to {routing_test_cache_path}")
        print(f"Routing dataset loaded with type: {type(routing_dataset)=}")
        print(f"{routing_dataset.dims=}")
        print(f"{routing_dataset.coords=}")
        print(f"{routing_dataset.data_vars=}")
        print(f"{routing_dataset.attrs=}")
        routing_streamflow = routing_dataset["streamflow"]
        print(f"Routing streamflow loaded with shape: {routing_streamflow.shape}")
        print(f"{routing_streamflow.dims=}")
        print(f"{routing_streamflow.coords=}")
        print(f"{routing_streamflow.chunksizes=}")
        print(f"{routing_streamflow.attrs=}")
