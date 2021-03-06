import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import pilotImage from './images/pilot.png';
import zoneImage from './images/zone.png';
import maintenanceImage from './images/maintenance.png';
import statusImage from './images/status.png';
import timeImage from './images/time.png';
import questionImage from './images/question.png';
import tailTop from './images/tail_top.png';
import tailInUse from './images/tail_inuse.png';
import tailAvailable from './images/tail_available.png';
import tailMaintenance from './images/tail_maintenance.png';

import './css/baseStyle.css';
import './css/dispatcherStyle.css';

let host = "http://lvh.me:8080";
host = "";

function getTimeDiff(oldTime) {
    const time = new Date().getTime();

    let timeDiff;

    const millsDiff = time - oldTime;
    const secondsDiff = millsDiff / 1000;
    const minutesDiff = Math.floor(secondsDiff / 60) % 60;
    const hoursDiff = Math.floor(secondsDiff / 60 / 60);

    if (hoursDiff == 0) {
        timeDiff = minutesDiff + " minutes";
    } else {
        timeDiff = hoursDiff + " hours and " + minutesDiff + " minutes";
    }

    //Take off last s if minute is 1
    if (minutesDiff == 1) {
        timeDiff = timeDiff.substr(0, timeDiff.length - 1);
    }

    return timeDiff;
}

$(document).ready(function () {
    $("#toolTipTable").hide();
    $("#toolTipTable").removeClass("hidden");

    $("#toolTipImg").on("mouseenter", function () {
        $("#toolTipTable").fadeIn("fast");
    });

    $("#toolTipTable").on("mouseleave", function () {
        $("#toolTipTable").fadeOut("fast");
    });

    $("#toolTipImg").on("mouseleave", function (event) {
        //Dont hide if leaving up
        if (event.pageY > $("#toolTipImg").offset().top) {
            $("#toolTipTable").fadeOut("fast");
        }
    });
});

//New React code
class InfoImage extends React.Component {
    render() {
        return <img className="infoImg" src={this.props.image} />
    }
}

class InfoText extends React.Component {
    render() {
        return (
            <div className="infoText" id={this.props.id}>{this.props.text}</div>
        );
    }
}

class Plane extends React.Component {
    maintenanceChanged(planeId, event) {
        //Change maintenance mode
        $.ajax({
            type: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: host + '/api/aircraft/' + planeId,
            data: JSON.stringify({
                operational: (event.target.checked ? false : true),
            })
        });
    }

    render() {
        return (
            <div className="plane">
                <div className="planeBox">
                    {
                        this.props.pilot != null ?
                            //Render this code if there is a flight
                            <>
                                <div className="planeInfoBox" key='1'>
                                    <InfoImage image={pilotImage} />
                                    <InfoText id="pilotName" text={this.props.pilot} />
                                </div>
                                <div className="planeInfoBox" key='2'>
                                    <InfoImage image={zoneImage} />
                                    <InfoText id="zone" text={'Zone ' + this.props.zone} />
                                </div>
                            </>
                            :
                            //Else render this code
                            <div className="planeInfoBox" id="maintenanceBox">
                                <InfoImage image={maintenanceImage} />
                                <InfoText id="maintenance" text="Maintenance" />
                                <form action="#" method="POST">
                                    {
                                        this.props.plane.operational ?
                                            <input type="checkbox" id="maintenanceTrigger" onChange={(e) => this.maintenanceChanged(this.props.plane.id, e)} />
                                            :
                                            <input type="checkbox" id="maintenanceTrigger" onChange={(e) => this.maintenanceChanged(this.props.plane.id, e)} defaultChecked="true" />
                                    }
                                </form>
                            </div>
                    }

                    {
                        this.props.pilot != null &&
                        //Show status if there is a flight
                        <div className="planeInfoBox">
                            <InfoImage image={statusImage} />
                            <InfoText text={this.props.started ? "In the air" : "On the ground"} />
                        </div>
                    }
                </div>
                {
                    this.props.plane.operational ?
                        this.props.pilot != null ?
                            <img className="tailBottom" src={tailInUse} />
                            :
                            <img className="tailBottom" src={tailAvailable} />
                        :
                        <img className="tailBottom" src={tailMaintenance} />
                }

                <img className="tailTop" src={tailTop} />
                <div id="planeNumber">{this.props.plane.id}</div>
            </div>
        );
    }
}

class PlaneList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            planes: [],
            flights: [],
        };

        this.loadData();
    }

    loadData() {
        const aircraftSocket = new WebSocket('ws://' + window.location.host + "/ws/aircraft");
        const flightSocket = new WebSocket('ws://' + window.location.host + "/ws/flights");

        aircraftSocket.onmessage = (message) => {
            const planesList = JSON.parse(message.data);
            const newPlanes = [];
            planesList.forEach(function (plane) {
                newPlanes.push(plane);
            });

            this.setState({
                planes: newPlanes,
            });
        }

        flightSocket.onmessage = (message) => {
            const flightList = JSON.parse(message.data);
            const newFlights = [];
            flightList.forEach(function (flight) {
                //Put each flight in array spot associated with plane
                if (!flight.completed) {
                    newFlights[flight.aircraftId - 1] = flight;
                }
            });

            this.setState({
                flights: newFlights,
            });
        }
    }

    render() {
        const planesList = this.state.planes.map((p, i) => {
            const flight = this.state.flights[i];
            let pilot = null;
            let zone = null;
            let started = null;

            if (flight != null) {
                for (i = 0; i < this.props.pilots.length; i++) {
                    if (this.props.pilots[i].id === flight.pilotId) {
                        pilot = this.props.pilots[i].firstName + " " + this.props.pilots[i].lastName;
                        break;
                    }
                }

                zone = flight.zoneId;
                started = flight.started;
            }

            return <Plane key={p.id} plane={p} pilot={pilot} zone={zone} started={started} />
        });

        return planesList;
    }
}

//Waiting list React code
class WaitingPilot extends React.Component {
    render() {
        const timeDiff = getTimeDiff(this.props.timeCreated);

        return (
            <div className="pilot">
                <div className="pilotBox">
                    <div className="pilotInfoBoxBig">
                        <InfoImage image={pilotImage} />
                        <div id="pilotName" className="bigInfoText">{this.props.pilotName}</div>
                    </div>
                    <div className="pilotInfoBox">
                        <InfoImage image={timeImage} />
                        <InfoText id="waitTime" text={'Has been waiting for ' + timeDiff} />
                    </div>
                </div>
            </div>
        );
    }
}

class WaitingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            waitingPilots: [],
            currentTime: new Date().getTime(),
        };

        this.loadData();
    }

    loadData() {
        const availabilitySocket = new WebSocket('ws://' + window.location.host + "/ws/availability");

        availabilitySocket.onmessage = (message) => {
            const availabilityList = JSON.parse(message.data);
            const newAvailabilities = [];

            //Sort by time
            availabilityList.sort(function (a, b) {
                return a.timeCreated - b.timeCreated;
            });

            availabilityList.forEach(function (pilot) {
                newAvailabilities.push(pilot);
            });

            this.setState({
                waitingPilots: newAvailabilities,
            });
        }
    }

    componentDidMount() {
        const that = this;
        setInterval(function () {
            that.setState({
                currentTime: new Date().getTime(),
            });
        }, 1000);
    }

    render() {
        return this.state.waitingPilots.map((p, i) => {
            let pilotName = "";
            for (i = 0; i < this.props.pilots.length; i++) {
                if (this.props.pilots[i].id === p.pilotId) {
                    pilotName = this.props.pilots[i].firstName + " " + this.props.pilots[i].lastName;
                    break;
                }
            }

            return <WaitingPilot key={p.pilotId} pilotName={pilotName} timeCreated={p.timeCreated} currentTime={this.state.currentTime} />
        });
    }
}

class ListHeader extends React.Component {
    render() {
        return <p className="listHeader">{this.props.text}</p>
    }
}


class MenuItem extends React.Component {
    render() {
        return (
            <tr>
                <td className="tipCellImg">
                    <InfoImage image={this.props.image} />
                </td>
                <td>{this.props.text}</td>
            </tr>
        );
    }
}

class HelpMenu extends React.Component {
    render() {
        return (
            <div id="toolTipInitiator">
                <table id="toolTipTable" className="hidden">
                    <tbody>
                        <tr>
                            <th colSpan="2">Help</th>
                        </tr>
                        <MenuItem text="Assigned Pilot" image={pilotImage} />
                        <MenuItem text="Assigned Zone" image={zoneImage} />
                        <MenuItem text="In/Out Maintenance" image={maintenanceImage} />
                        <MenuItem text="Plane Status" image={statusImage} />
                        <MenuItem text="Time Waiting" image={timeImage} />
                        <tr>
                            <td className="tipCellImg" id="tipColorGreen"></td>
                            <td>Avaliable</td>
                        </tr>
                        <tr>
                            <td className="tipCellImg" id="tipColorGold"></td>
                            <td>In Use</td>
                        </tr>
                        <tr>
                            <td className="tipCellImg" id="tipColorRed"></td>
                            <td>Under Maintenance</td>
                        </tr>
                    </tbody>
                </table>
                <img id="toolTipImg" src={questionImage} />
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pilots: [],
        };

        this.loadData();
    }

    loadData() {
        const pilotSocket = new WebSocket('ws://' + window.location.host + "/ws/pilots");

        pilotSocket.onmessage = (message) => {
            const pilotList = JSON.parse(message.data);
            const newPilots = [];
            pilotList.forEach(function (pilot) {
                newPilots.push(pilot);
            });

            this.setState({
                pilots: newPilots,
            });
        }
    }

    render() {
        return (
            <>
                <div id="planeInfo" className="column" key={1}>
                    <ListHeader text="Planes" />
                    <PlaneList pilots={this.state.pilots} />
                </div>
                <div id="waitingList" className="column" key={2}>
                    <ListHeader text="Waiting List" />
                    <WaitingList pilots={this.state.pilots} />
                </div>
                <HelpMenu key={3} />
            </>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById("root")
);