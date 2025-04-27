# Flight Data to GEOJSON

Currently this is a very traditional approach to run a python script, the desire would be to run this through node but this has not been achieved yet.

## Project Setup

This is still very tacky but in order to use this script you need to run the following after ensuring that you've got a current version of Python installed. If you're on windows this can be achieved by going to the Microsoft Store and searching/installing Python.

Once you've achieved this run the following script to create/activate a virtual environment and then to install the requirements.

```sh
python3 -m venv myenv
source myenv/Scripts/activate

pip install -r requirements.txt
```

Once the virtual environment has been activated and the packages installed the script can be used by placing all desired flight (and eventually hike/train) data into the flight_data folder, ordering so that the first flight is called flight_1.kml etc. This will ensure that when the script lists the hierarchy this is in the order that they happened.

```sh
python convert_kml2geojson.py
```

The script will take some time as it has to open and convert all kml files.
