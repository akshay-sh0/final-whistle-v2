locals {
  name_suffix = "${var.workload}-${var.environment}"

  common_tags = {
    workload    = var.workload
    environment = var.environment
    managed_by  = "terraform"
    repository  = "final-whistle-v2"
    cost_centre = "personal"
  }
}