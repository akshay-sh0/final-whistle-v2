resource "azurerm_resource_group" "backend" {
  name     = "rg-finalwhistle-tfstate-uks"
  location = "uksouth"

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_storage_account" "backend" {
  #checkov:skip=CKV_AZURE_33:Queue storage is not used by this Terraform state account.
  #checkov:skip=CKV_AZURE_59:Public network access is required by Microsoft-hosted Azure DevOps agents; anonymous blob access is disabled.
  #checkov:skip=CKV_AZURE_206:LRS is an accepted cost-saving choice for this development portfolio environment.
  #checkov:skip=CKV2_AZURE_33:A private endpoint would require private networking and a private build agent, adding unnecessary cost.
  #checkov:skip=CKV2_AZURE_1:Microsoft-managed encryption is sufficient for this low-risk development state; CMK adds Key Vault cost and management.
  name                     = "stfwtfstate1398712156"
  resource_group_name      = azurerm_resource_group.backend.name
  location                 = azurerm_resource_group.backend.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  access_tier              = "Hot"

  https_traffic_only_enabled      = true
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = false

  blob_properties {
    delete_retention_policy {
      days = 7
    }

    container_delete_retention_policy {
      days = 7
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_storage_container" "tfstate" {
  #checkov:skip=CKV2_AZURE_21:Blob read logging cost is not justified for this low-risk development state.
  name                  = "tfstate"
  storage_account_id    = azurerm_storage_account.backend.id
  container_access_type = "private"

  lifecycle {
    prevent_destroy = true
  }
}
