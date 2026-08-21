import { useState } from "react";
import { assets as initialAssets } from "../data/dummyData";

function useAssets() {
  const [assets, setAssets] =
    useState(initialAssets);

  const addAsset = (newAsset) => {
    const asset = {
      id: Date.now(),
      ...newAsset,
    };

    setAssets((current) => [
      ...current,
      asset,
    ]);

    return asset;
  };

  const updateAsset = (id, updatedData) => {
    setAssets((current) =>
      current.map((asset) =>
        asset.id === id
          ? {
              ...asset,
              ...updatedData,
            }
          : asset
      )
    );
  };

  const deleteAsset = (id) => {
    setAssets((current) =>
      current.filter(
        (asset) => asset.id !== id
      )
    );
  };

  const getAssetById = (id) => {
    return assets.find(
      (asset) => asset.id === Number(id)
    );
  };

  return {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    getAssetById,
  };
}

export default useAssets;