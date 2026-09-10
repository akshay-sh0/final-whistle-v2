resource "azurerm_resource_group" "main" {
  name     = "rg-${local.name_suffix}"
  location = var.location
  tags     = local.common_tags
}

resource "azurerm_static_web_app" "main" {
  name                = "stapp-${local.name_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.static_web_app_location
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = local.common_tags

  lifecycle {
    ignore_changes = [
      repository_branch,
      repository_url,
    ]
  }
}

resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "budget-${local.name_suffix}"
  resource_group_id = azurerm_resource_group.main.id

  amount     = 500
  time_grain = "Monthly"

  time_period {
    start_date = "2026-10-01T00:00:00Z"
  }

  notification {
    enabled        = true
    threshold      = 80
    operator       = "GreaterThanOrEqualTo"
    threshold_type = "Forecasted"
    contact_emails = ["akshaydshirodkar@gmail.com"]
  }

  notification {
    enabled        = true
    threshold      = 100
    operator       = "GreaterThanOrEqualTo"
    threshold_type = "Actual"
    contact_emails = ["akshaydshirodkar@gmail.com"]
  }
}