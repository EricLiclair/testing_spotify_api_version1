import React, { Component } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      spotifyAuthenticated: false,
      song: {
        'title': "chrimosium",
        'artist': "Eric Liclair",
        'duration': 3000,
        'time': 2250,
        'image_url': "https://github.com/EricLiclair/imageHost/blob/master/300x300.png?raw=true",
        'is_playing': false,
        'votes': 0,
        'id': "192.168.1.1"
      }
    };
    this.roomCode = this.props.match.params.roomCode;
    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getCurrentSong = this.getCurrentSong.bind(this);
    this.getRoomDetails();
  }
// the componentDidMount and componentWillUnmount are used to poll continously.
// Which is to get regular requests and keep updating.
  componentDidMount() {
    this.interval = setInterval(this.getCurrentSong, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getRoomDetails() {
    return fetch("/api/get-room" + "?code=" + this.roomCode)
      .then((response) => {
        if (!response.ok) {
          this.props.leaveRoomCallback();
          this.props.history.push("/");
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
        if (this.state.isHost) {
          this.authenticateSpotify();
        }
      });
  }

  authenticateSpotify() {
    fetch('/spotify/is-authenticated')
      .then((response) => response.json())
      .then((data) => {
        this.setState({spotifyAuthenticated: data.status});
        console.log(data.status);
        if (!data.status) {
          fetch('/spotify/get-auth-url')
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            }); 
        }
      });
  }

  getCurrentSong() {
    fetch('/spotify/current-song')
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        console.log(data);
        this.setState({ song: data });
      });
  }

  leaveButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions)
      .then((_response) => {
      this.props.leaveRoomCallback();
      this.props.history.push("/");
    });
  }

  updateShowSettings(value) {
    this.setState({
      showSettings: value,
    });
  }

  renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={this.state.votesToSkip}
            guestCanPause={this.state.guestCanPause}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderSettingsButton() {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  render() {
    if (this.state.showSettings) {
      return this.renderSettings();
    }
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Code: {this.roomCode}
          </Typography>
          <MusicPlayer {...this.state.song} />
        </Grid>
        {this.state.isHost ? this.renderSettingsButton() : null}
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}


// import React, { Component } from "react";
// import { Grid, Button, Typography } from "@material-ui/core";
// import CreateRoomPage from "./CreateRoomPage";

// export default class Room extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             votesToSkip: 2,
//             guestCanPause: false,
//             isHost: false,
//             showSettings: false,
//         };
//         this.roomCode = this.props.match.params.roomCode;
//         this.getRoomDetails();
//         this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
//         this.updateShowSettings = this.updateShowSettings.bind(this);
//         this.renderSettingsButton = this.renderSettingsButton.bind(this);
//         this.renderSettings = this.renderSettings.bind(this);
//         // this.getRoomDetails = this.getRoomDetails.bind(this);
//         // this.getRoomDetails();
//     }


//     getRoomDetails() {
//         fetch('/api/get-room' + '?code=' + this.roomCode)
//         .then((response) => {
//             if (!response.ok) {
//                 this.props.leaveRoomCallback();
//                 this.props.history.push('/');
//             }
//             return response.json();
//         })
//         .then((data) => {
//             this.setState({
//                 votesToSkip: data.votes_to_skip,
//                 guestCanPause: data.guest_can_pause,
//                 isHost: data.is_host,
//             });
//         });
//     }

//     leaveButtonPressed() {
//         const requestOptions = {
//             method: "POST",
//             headers: {"Content-Type": "application/json"},
//         };
//         fetch('/api/leave-room', requestOptions)
//         .then((_response) => {
//             this.props.leaveRoomCallback();
//             this.props.history.push('/');
//         });
//     }

//     updateShowSettings(value) {
//         this.setState({
//             showSettings: value,
//         });
//     }

//     renderSettings() {
//         return (
//             <Grid container spacing={1}>
//                 <Grid item xs={12} align="center">
//                     <CreateRoomPage 
//                         update={true} 
//                         votesToSkip={this.state.votesToSkip} 
//                         guestCanPause={this.state.guestCanPause} 
//                         roomCode={this.roomCode} 
//                         updateCallback={this.getRoomDetails}
//                     />
//                 </Grid>
//                 <Grid item xs={12} align="center">
//                     <Button 
//                         variant="contained" 
//                         color="secondary" 
//                         onCLick={() => this.updateShowSettings(false)}
//                     >
//                         Close
//                     </Button>
//                 </Grid>
//             </Grid>
//         );
//     }

//     renderSettingsButton() {
//         return (
//             <Grid item xs={12} align="center">
//                 <Button 
//                     variant="contained" 
//                     color="primary" 
//                     onCLick={() => this.updateShowSettings(true)}
//                 >
//                     Settings
//                 </Button>
//             </Grid>
//         );
//     }
    
//     render() {
//         if (this.state.showSettings) {
//             return this.renderSettings();
//         }
//         // /*
//         return (
//             <Grid container spacing={1}>
//                 <Grid item xs={12} align="center">
//                     <Typography variant="h4" component="h4">
//                         Code: {this.roomCode}
//                     </Typography>
//                 </Grid>
//                 <Grid item xs={12} align="center">
//                     <Typography variant="h6" component="h6">
//                         Votes: {this.state.votesToSkip}
//                     </Typography>
//                 </Grid>
//                 <Grid item xs={12} align="center">
//                     <Typography variant="h6" component="h6">
//                         Guest Can Pause: {this.state.guestCanPause.toString()}
//                     </Typography>
//                 </Grid>
//                 <Grid item xs={12} align="center">
//                     <Typography variant="h6" component="h6">
//                         Host: {this.state.isHost.toString()}
//                     </Typography>
//                 </Grid>
//                 {this.state.isHost ? this.renderSettingsButton() : null}
//                 <Grid item xs={12} align="center">
//                     <Button variant="contained" color="secondary" onClick={this.leaveButtonPressed}>
//                         Leave Room
//                     </Button>
//                 </Grid>
//             </Grid>
//         );
//     }
// }
// ======================