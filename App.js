import React, { Component } from "react";
import { StyleSheet, Text, View, TextInput, FlatList } from "react-native";
import { StackNavigator, NavigationActions } from "react-navigation";
import { Button, FormInput, FormLabel } from "react-native-elements";

export class SlackyApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: null,
      messages: [],
      channels: ["General", "Other_Channel"]
    };
    this.websocket = new WebSocket(`ws://localhost:8080`);
  }
  componentDidMount() {
    this.websocket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      console.log("Message from server ", message);
      switch (message.type) {
        case "CONNECTION_START":
        default:
          break;
        case "MESSAGES":
          this.setState({ messages: message.data });
          break;
      }
    });
  }

  handleUserName = userName => {
    this.setState({ userName: userName });
    this.websocket.send(
      JSON.stringify({
        type: "LOGIN",
        userName: userName
      })
    );
  };

  sendMessage = (message, channel) => {
    console.log(this.state);
    this.websocket.send(
      JSON.stringify({
        type: "NEW_MESSAGE",
        userName: this.state.userName,
        message: message,
        channel: channel
      })
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.25, backgroundColor: "#333" }}>
          <Text> </Text>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 20
            }}
          >
            SLACKY PRO EVOLUTION
          </Text>
        </View>
        {this.state.userName ? (
          <View style={{ flex: 3, backgroundColor: "white" }}>
            <Channels
              sendMessage={this.sendMessage}
              messages={this.state.messages}
              channels={this.state.channels}
              navigation={this.props.navigation}
            />
          </View>
        ) : (
          <View style={{ flex: 3, backgroundColor: "white" }}>
            <Login handleUserName={this.handleUserName} />
          </View>
        )}
      </View>
    );
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };
  }

  handleSubmit = event => {
    event.preventDefault();
    this.props.handleUserName(this.state.value);
  };

  render() {
    return (
      <View>
        <FormLabel>Login</FormLabel>
        <FormInput
          placeholder="Please enter your login"
          onChangeText={value => this.setState({ value })}
          onSubmitEditing={this.handleSubmit}
          autoCorrect={false}
        />
      </View>
    );
  }
}

function Channels(props) {
  const buttons = props.channels;

  return buttons.map((channel, index) => (
    <Button
      key={index}
      onPress={() =>
        props.navigation.navigate(channel, {
          userName: props.userName,
          sendMessage: props.sendMessage,
          messages: props.messages,
          channel: channel
        })
      }
      buttons={buttons}
      containerStyle={{ height: 100 }}
      raised
      icon={{ name: "group", size: 32 }}
      buttonStyle={{ backgroundColor: "#333", marginTop: 5 }}
      textStyle={{ textAlign: "center", color: "white" }}
      title={channel}
    />
  ));
}

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: ""
    };
  }

  handleSubmit = () => {
    this.props.navigation.state.params.sendMessage(this.state.newMessage, this.props.navigation.state.params.channel);
    this.setState({ newMessage: "" });
  };

  render() {
    return (
      <View>
        <FlatList
          data={this.props.messages}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.userName}>{item.userName} : </Text>
              <Text>{item.message}</Text>
            </View>
          )}
        />
        <TextInput
          style={{ height: 40, textAlign: "center" }}
          placeholder="Send a message"
          onChangeText={newMessage => this.setState({ newMessage })}
          onSubmitEditing={this.handleSubmit}
          value={this.state.newMessage}
          autoCorrect={false}
        />
      </View>
    );
  }
}

const RootNavigator = StackNavigator({
  Home: {
    screen: SlackyApp,
    navigationOptions: {
      headerTitle: "Slacky"
    }
  },
  General: {
    screen: Chat,
    navigationOptions: {
      headerTitle: "General"
    }
  },
  Other_Channel: {
    screen: Chat,
    navigationOptions: {
      headerTitle: "Other_Channel"
    }
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  userName: {
    fontWeight: "bold",
    backgroundColor: "#333",
    color: "#fff"
  }
});

export default RootNavigator;
