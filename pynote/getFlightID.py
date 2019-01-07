
# coding: utf-8

# In[3]:

import numpy as np
import pandas as pd
import requests
import json

raw_data_path = "../data/pek16.10.27departure.csv"
data_with_flightID_path = '../data/flightIDs/pek16.10.28depatureFlightID.csv'
flightID_path = "../data/flightIDs/pek16.10.27departureFlightID.csv"


def getflightID(callsign):
    print("query for ", callsign)
    url1 = "https://www.flightradar24.com/v1/search/web/find?query=" + callsign + "&limit=18&type=schedule"
    r = requests.get(url1)
    flights = json.loads(r.text)["results"]
    res = ""
    for aFlight in flights:
        label = aFlight['label']
        words = label.split(' ')
        for word in words:
            if word == callsign:
                res = aFlight
                break
    if "id" in res:
        return res['id']
    else:
        return '-1'


def main():


    arr_df =pd.read_csv(raw_data_path)
    callsignG = arr_df.groupby("Callsign")

    lastRecord = callsignG.last()

    lastRecord = lastRecord.reset_index()

    lastRecord['FlightID'] = ""

    lastRecord['FlightID'] = lastRecord.apply(lambda x: getflightID(x.Callsign), axis=1 )


    flightIDMap  = lastRecord.drop(['Time','Position','Altitude','Speed','Direction'],axis=1)


    flightIDMap.to_csv(flightID_path,index=False)



    illegalCallsigns = flightIDMap[flightIDMap['FlightID'] == "-1"]['Callsign'].tolist()


    df = arr_df[np.logical_not(arr_df['Callsign'].isin(illegalCallsigns))]


    df = df[np.logical_not(pd.isnull(df['Callsign']))]


    df = df.drop_duplicates()

    flightIDMap2 = flightIDMap.set_index('Callsign')


    callsignMap = flightIDMap2.to_dict('index')


    df['FlightID'] = df.apply(lambda x: callsignMap[x.Callsign]['FlightID'],axis=1)


    df.to_csv(data_with_flightID_path, index=False)

if __name__ == "__main__":
    main()



