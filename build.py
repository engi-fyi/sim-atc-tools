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


DIST = "./web/dist"
WEB = "./web"
LOCAL = "./web/local"
SRC = "./web/src"
DATA = "./data"
CUSTOM = "./custom"
CONFIG = "./config"
ASSETS = "./web/assets"


def compile_css_assets(folder_name, prefix=""):
    with open(f"{SRC}/styles.sass", "r") as style:
        sass_in = style.read()
        style.close()
        css_out = sass.compile(string=sass_in)

        with open(f"{WEB}/{folder_name}/{prefix}styles.css", "w") as compiled_style:
            compiled_style.write(css_out)
            compiled_style.close()


def local():
    print("Serving fresh copy of assets.")
    print("Compiling CSS.")
    compile_css_assets("local")
    print("Copying HTML and JS.")
    shutil.copy2(f"{SRC}/index.html", f"{LOCAL}/index.html")
    shutil.copy2(f"{SRC}/app.js", f"{LOCAL}/app.js")
    copy_data("local")
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
        destination_file_name = f"{WEB}/{folder_name}/data/{m}.json"
        Path(f"{WEB}/{folder_name}/data").mkdir(parents=True, exist_ok=True)
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
    compile_css_assets("dist", prefix)
    print("Copying HTML and JS.")
    shutil.copy2(f"{SRC}/app.js", f"{DIST}/{prefix}app.js")
    build_index(prefix)
    copy_data("dist")
    copy_static_assets()
    generate_version_references(prefix)


def build_index(prefix):
    target_index = f"{DIST}/index.html"
    copy_file(f"{SRC}/index.html", target_index)
    f = open(target_index, "rt")
    data = f.read()
    f.close()

    data = data.replace("app.js", f"{prefix}app.js")
    data = data.replace("styles.css", f"{prefix}styles.css")

    f = open(target_index, "wt")
    f.write(data)
    f.close()


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
