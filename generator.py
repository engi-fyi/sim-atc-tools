import requests
import json
import os

from bs4 import BeautifulSoup
from lunr import lunr

CONFIGURATION_DIRECTORY = "config/"
OUTPUT_DIRECTORY = "data/"
CUSTOM_DIRECTORY = "custom/"
BS4_PARSER_TYPE = "html.parser"


class DataContainerDto:
    def __init__(self):
        self.data = {}
        self.indexed = []


def main():
    for cm in get_configured_modules():
        data = generate_data(cm)
        write_data(cm, data)


def get_configured_modules():
    module_files = os.listdir(CONFIGURATION_DIRECTORY)
    modules = []

    for mf in module_files:
        module = None
        module_file_path = CONFIGURATION_DIRECTORY + mf

        with open(module_file_path, "r") as f:
            module = json.load(f)
            modules.append(module)

    return modules


def write_data(module, data):
    normal_data = {}
    index_data = []

    for d in data:
        for k in d.data.keys():
            if k not in normal_data:
                normal_data[k] = []

            for v in d.data[k]:
                normal_data[k].append(v)
                index_data.append(v)
        # normal_data.update(d.data)

    index_data.extend(d.indexed)

    index_data_file = OUTPUT_DIRECTORY + "indexed_" + module["dataset_name"] + ".json"
    idx = lunr(
        ref="icao_code",
        fields=module["fields"],
        documents=index_data
    )
    serialized_idx = idx.serialize()
    with open(index_data_file, "w") as idf:
        idf.write(json.dumps(serialized_idx))
        idf.close()

    data_file = OUTPUT_DIRECTORY + module["dataset_name"] + ".json"
    with open(data_file, "w") as df:
        df.write(json.dumps(normal_data))
        df.close()


def generate_data(module):
    data = []
    if module["a_to_z"]:
        print("Generating a to z data.")
        ord_list = []

        if module["a_to_z_has_0_to_9"]:
            ord_list = ["0-9"] + list(range(ord("A"), (ord("Z") + 1)))
        else:
            ord_list = list(range(ord("A"), (ord("Z") + 1)))

        for o in ord_list:
            data.append(generate_a_to_z_data(module, o))

    else:
        print("Generating single page data.")
        data.append(generate_single_page_data(module))

    if module["has_custom"]:
        data.append(load_custom_data(module))

    return data


def load_custom_data(module):
    data = DataContainerDto()

    custom_file_name = CUSTOM_DIRECTORY + module["dataset_name"] + ".json"
    with open(custom_file_name) as f:
        custom_data = json.load(f)

        for k in custom_data.keys():
            if k not in data.data:
                data.data[k] = []

            for v in custom_data[k]:
                data.data[k].append(v)
                data.indexed.append(v)

        print(f"Added '{len(custom_data)}' custom record(s) to '" + module["dataset_name"] + "'.")

    return data


def generate_a_to_z_data(module, raw_letter):
    if type(raw_letter).__name__ == "int":
        letter = chr(raw_letter)
    else:
        letter = raw_letter

    request_url = module["wikipedia_url"] + module["a_to_z_prefix"] + letter + module["a_to_z_postfix"]
    return generate_single_page_data(module, request_url)


def generate_single_page_data(module, request_url=None):
    if request_url is None:
        request_url = module["wikipedia_url"]

    headers = {
        "User-Agent": "sim-atc-crawler / 1.0 email=feedback@sim-atc.com"
    }
    data = DataContainerDto()
    page = requests.get(request_url, headers=headers)
    print(f"'{request_url}' retrieved (status code: {page.status_code}).")

    
    soup = BeautifulSoup(page.content, BS4_PARSER_TYPE)
    table = soup.find("table", class_="wikitable")
    table_body = table.find("tbody")
    rows = table_body.find_all("tr")

    for row in rows:
        # 1 :: IATA, 2 :: ICAO, 3 :: Airline, 4 :: Call Sign, 5 :: Country, 6 :: Comments
        cells = row.find_all("td")

        if len(cells) >= len(module["fields"]):
            icao_code_index = module["fields"].index("icao_code")
            icao_code = cells[icao_code_index].get_text().rstrip()
            if icao_code not in data.data:
                data.data[icao_code] = []

            data_container = {}

            for i in range(0, len(module["fields"])):
                data_container[module["fields"][i]] = cells[i].get_text().rstrip()

            data.data[icao_code].append(data_container)
            data.indexed.append(data_container)

    return data


if __name__ == "__main__":
    main()
