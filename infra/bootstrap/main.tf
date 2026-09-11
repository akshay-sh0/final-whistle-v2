resource "azurerm_resource_group" "backend" {
  name     = "rg-finalwhistle-tfstate-uks"
  location = "uksouth"

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_storage_account" "backend" {
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

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_id    = azurerm_storage_account.backend.id
  container_access_type = "private"

  lifecycle {
    prevent_destroy = true
  }
}
