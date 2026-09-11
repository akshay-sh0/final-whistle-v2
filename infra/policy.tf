data "azurerm_policy_definition" "require_tag" {
  name = "871b6d14-10aa-478d-b590-94f262ecfa99"
}

resource "azurerm_resource_group_policy_assignment" "require_workload_tag" {
  name                 = "require-workload-tag"
  display_name         = "Require workload tag on resources"
  resource_group_id    = azurerm_resource_group.main.id
  policy_definition_id = data.azurerm_policy_definition.require_tag.id
  enforce              = false

  parameters = jsonencode({
    tagName = {
      value = "workload"
    }
  })
}
