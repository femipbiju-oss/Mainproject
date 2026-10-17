import math


# Predefined resource planning rules
RESOURCE_RULES = [
    {
        "resource": "Drinking Water",
        "rate": 3,
        "unit": "Litres",
        "basis": "3 litres / person / day"
    },
    {
        "resource": "Food Packets",
        "rate": 2,
        "unit": "Packets",
        "basis": "2 packets / person / day"
    },
    {
        "resource": "Medical Kits",
        "rate": 0.1,
        "unit": "Kits",
        "basis": "1 kit / 10 people"
    },
    {
        "resource": "Blankets",
        "rate": 0.5,
        "unit": "Units",
        "basis": "1 blanket / 2 people"
    },
    {
        "resource": "Temporary Shelters",
        "rate": 0.1,
        "unit": "Units",
        "basis": "1 shelter / 10 people"
    }
]


def generate_requirements(affected_population):

    requirements = []

    for rule in RESOURCE_RULES:

        quantity = math.ceil(
            affected_population * rule["rate"]
        )

        requirements.append({
            "resource": rule["resource"],
            "quantity": quantity,
            "unit": rule["unit"],
            "planning_basis": rule["basis"]
        })

    return requirements