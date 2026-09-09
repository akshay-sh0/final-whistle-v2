variable "workload" {
  description = "Name of the application workload."
  type        = string
  default     = "finalwhistle-v2"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"

}

variable "location" {
  description = "Primary Azure region for the workload."
  type        = string
  default     = "uksouth"

}

variable "static_web_app_location" {
  description = "Azure region used by Static Web App"
  type        = string
  default     = "westeurope"

}

