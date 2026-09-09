output "site_url" {
  description = "Public URL of the final whistle static web app."
  value       = "https://${azurerm_static_web_app.main.default_host_name}"

}