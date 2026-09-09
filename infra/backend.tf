terraform {
  backend "azurerm" {
    resource_group_name  = "rg-finalwhistle-tfstate-uks"
    storage_account_name = "stfwtfstate1398712156"
    container_name       = "tfstate"
    key                  = "finalwhistle-v2.dev.tfstate"
    use_azuread_auth     = true
    use_cli              = true
  }
}