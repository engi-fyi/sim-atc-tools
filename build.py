import sass
import shutil
import http.server
import socketserver
import os
import watchgod
import argparse
import hashlib
import shortuuid
import datetime
import json

from pathlib import Path
from jinja2 import Template


DIST = "./web/dist"
WEB = "./web"
LOCAL = "./web/local"
SRC = "./web/src"
DATA = "./data"
CUSTOM = "./custom"
CONFIG = "./config"
ASSETS = "./web/assets"
JAVASCRIPT_SRC = "./web/src/js"
SASS_SRC = "./web/src/css"
HTML_SRC = "./web/src/html"


def build_html(folder_name):
    all_source_files = os.listdir(HTML_SRC)
    jinja_files = [f for f in all_source_files if f.endswith(".jinja2")]
    templates = {}
    index_raw = ""

    for jinja_file in jinja_files:
        index_name = jinja_file.replace(".html.jinja2", "")

        with open(f"{HTML_SRC}/{jinja_file}", "r") as jt:
            templates[index_name] = jt.read()
            jt.close()

    with open(f"{SRC}/index.html.jinja2", "r") as ir:
        index_raw = ir.read()
        ir.close()

    index_template = Template(index_raw)

    with open(f"{folder_name}/index.html", "w") as compiled_index:
        compiled_index.write( index_template.render(templates=templates))
        compiled_index.close()


def compile_css_assets(folder_name, prefix=""):
    all_source_files = os.listdir(SASS_SRC)
    sass_files = [f for f in all_source_files if f.endswith(".scss")]
    full_sass = ""
    sass_files.sort()  # so variables get processed first

    for css_file in sass_files:
        print(f"Ingesting '{css_file}'.")
        with open(f"{SASS_SRC}/{css_file}", "r") as style:
            full_sass = f"{full_sass}{style.read()}\n"
            style.close()

    css_out = sass.compile(string=full_sass)

    with open(f"{folder_name}/{prefix}styles.css", "w") as compiled_style:
        compiled_style.write(css_out)
        compiled_style.close()


def compile_javascript_assets(folder_name, prefix=""):
    all_source_files = os.listdir(JAVASCRIPT_SRC)
    js_files = [f for f in all_source_files if f.endswith(".js")]
    full_js = ""

    for js_file in js_files:
        with open(f"{JAVASCRIPT_SRC}/{js_file}", "r") as script:
            full_js = f"{full_js}{script.read()}\n\n"
            script.close()

    with open(f"{folder_name}/{prefix}app.js", "w") as compiled_js:
        compiled_js.write(full_js)
        compiled_js.close()


def local():
    print("Serving fresh copy of assets.")
    print("Compiling CSS and Javascript.")
    compile_css_assets(LOCAL)
    compile_javascript_assets(LOCAL)
    print("Building HTML.")
    build_html(LOCAL)
    print("Copying data files.")
    copy_data(LOCAL)
    print("Web server running.")
    serve_local(8080)


def serve_local(port):
    web_dir = os.path.join(os.path.dirname(__file__), LOCAL)
    os.chdir(web_dir)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", port), handler)
    print(f"Listening on port '{port}'.")
    httpd.serve_forever()


def copy_data(folder_name, force_fresh=False):
    for m in ["airline", "aircraft", "airport"]:
        source_file_name = f"{DATA}/{m}.json"
        destination_file_name = f"{folder_name}/data/{m}.json"
        Path(f"{folder_name}/data").mkdir(parents=True, exist_ok=True)
        copy_file(source_file_name, destination_file_name, force_fresh)


def delete_dist():
    fid = os.listdir(DIST)

    filtered_files = [f for f in fid if f.endswith(".html") or f.endswith(".js") or f.endswith(".css")]

    for file in filtered_files:
        path_to_file = os.path.join(DIST, file)
        os.remove(path_to_file)
        print(f"Deleting existing files at '{path_to_file}'.")


def build():
    delete_dist()
    prefix = (shortuuid.uuid()[:7] + "_").lower()
    print("Compiling CSS.")
    compile_css_assets(DIST, prefix)
    compile_javascript_assets(DIST, prefix)
    print("Copying HTML and JS.")
    build_html(DIST)
    copy_data(DIST)
    copy_static_assets()
    generate_version_references(prefix)


def copy_file(source_file_name, destination_file_name, force_fresh=False):
    changes = True

    if os.path.isfile(source_file_name):
        if os.path.isfile(destination_file_name):
            if not force_fresh:
                source_hash = hashlib.md5(open(source_file_name, "rb").read()).hexdigest()
                destination_hash = hashlib.md5(open(destination_file_name, "rb").read()).hexdigest()

                if source_hash == destination_hash:
                    changes = False
        if changes:
            print("There have been changes, copying new data files.")
            shutil.copy2(source_file_name, destination_file_name)
    else:
        print("Sorry, the source file doesn't exist. Try 'generate' first.")


def generate_version_references(prefix):
    version = prefix[:-1]
    build_date = datetime.datetime.now()
    build_date = str(build_date.replace(tzinfo=datetime.timezone.utc))
    version_details = {
        "build_date": build_date,
        "version": version
    }

    f = open(f"{DIST}/version.json", "wt")
    f.write(json.dumps(version_details, indent=4))
    f.close()

    print(f"Deployed version '{version}'.")


def copy_static_assets():
    print("Copying static assets.")
    static_assets = os.listdir(ASSETS)

    for sa in static_assets:
        source_file = os.path.join(ASSETS, sa)
        destination_file = os.path.join(DIST, sa)
        copy_file(source_file, destination_file)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build tool for sim-atc.com.")
    parser.add_argument("command", metavar="C", type=str, help="build, generate, local, or deploy")
    args = parser.parse_args()

    if args.command == "local":
        watchgod.run_process(f"{SRC}", local, watcher_cls=watchgod.AllWatcher)
    elif args.command == "build":
        build()
    else:
        print("Sorry, that wasn't a valid command. Try again.")
