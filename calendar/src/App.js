import React from 'react';
import './App.css';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';

function reducer(state, action){
  if(!state){
    return {events: localStorage.events && JSON.parse(localStorage.events) || []};
  }
  if(action.type === 'LOGIN'){
    localStorage.token = 'token';
    return {...state, login: localStorage.token};
  }
  if(action.type === 'LOGOUT'){
    delete localStorage.events;
    delete localStorage.token;
    return {...state, login: null};
  }
  if(action.type === 'SAVE_DATA'){
    localStorage.events = JSON.stringify(state.events);
  }
  if(action.type === 'ADD_EVENT'){
    return {...state, events: [...state.events, action.data]};
  }
  if(action.type === 'RM_EVENT'){
    let events = state.events.filter(e => (e.start !== action.data.start && e.title !== action.data.title));
    return {...state, events: events, eventToRemove: null};
  }
  if(action.type === 'EVENT_TO_REMOVE'){
    return {...state, eventToRemove: action.data};
  }
  return state;
}

const store = createStore(reducer);
store.subscribe(()=>console.log("store",store.getState()));

function addEvent(event){
  return {type: 'ADD_EVENT', data: event};
}

function removeEvent(event){
  console.log("remove", event);
  return {type: 'RM_EVENT', data: event};
}

function setEventToRemove(event){
  return {type: 'EVENT_TO_REMOVE', data: event};
}

function exportEvents(events){
  events.length &&
  fetch('/calendar',
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(events)
    })
  .then(res => res.json())
  return {type: 'EXPORT_EVENTS', data: events};
}

function authenticate(){
  //authentification
  return {type: 'LOGIN', data: 'token'};
}

class FormInput extends React.Component{
  constructor(props){
    super(props);
    this.state = {time: "08:00", start: 0, duration: 5, title: ''};
    this.getStartTime = this.getStartTime.bind(this);
  }
  getStartTime(time){
    this.setState({time: time});
    let hours = +time.split(":")[0];
    let minutes = +time.split(":")[1];
    let startTime = (hours - 8) * 60 + minutes;
    this.setState({start: startTime});
  }
  render(){
    return(
      <div>        
        <input type="time" value={this.state.time} min="08:00" max="16:55" step="300"
          onChange={e => this.getStartTime(e.target.value)}/>
        <input type="number" value={this.state.duration} min="5" step="5" onChange={e => this.setState({duration: +e.target.value})}/>
        <input type="text" value={this.state.title} onChange={e => this.setState({title: e.target.value})}/>
        <button type="button" value="Add"
          onClick={() => this.props.addEvent({start: this.state.start, duration: this.state.duration, title: this.state.title})}>
            ADD
        </button><br />
        <div style={{width: '400px', height: '25px', border: '1px solid black', margin: '0 auto'}}>
          {this.props.eventToRemove ? this.props.eventToRemove.title : ' '}</div>
        <button type="button" value="Del" onClick={() => this.props.removeEvent(this.props.eventToRemove)}
          disabled={this.props.eventToRemove ? '' : 'disabled'}
          >DEL</button>
        <button type="button" onClick={()=>this.props.exportEvents(this.props.events)}>Export</button>
        {!this.props.login &&
          <button type="button" onClick={()=> store.dispatch({type: 'LOGIN'})}>LOGIN</button>
        }
        {this.props.login &&
          <button type="button" onClick={()=> store.dispatch({type: 'LOGOUT'})}>LOGOUT</button>}
        {this.props.login &&
          <button type="button" onClick={()=> store.dispatch({type: 'SAVE_DATA'})}>SAVE</button>
        }
      </div>
    )
  }
}

let mapStateToProps = state => ({
  login: state.login || localStorage.token,
  events: (state.events.length && state.events) || (localStorage.events && JSON.parse(localStorage.events)),
  eventToRemove: state.eventToRemove
})

let mapDispatchToProps = {
  addEvent,
  removeEvent,
  exportEvents,
  authenticate
}

FormInput = connect(mapStateToProps, mapDispatchToProps)(FormInput);

let Time = p =>
  <div className="time">
    {p.children}
  </div>

class Event extends React.Component{
  render(){
    return(
      <div className="event" style={this.props.style} onClick={evt=>this.props.setEventToRemove(this.props.event)}>
        {this.props.children}
      </div>
    )
  }
}

Event = connect(()=>({}), {setEventToRemove})(Event);

class Calendar extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      time: ["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00"],
    };
  }
  render(){
    return(
      <div className="calendar">
        <div className="times">{this.state.time.map((t, i) => <Time key={i}>{t}</Time>)}</div>
        <div className="events">{this.props.events && this.props.events.map((event, i, arr) => {
          let start = event.start || 1;
          let end = (event.start + (+event.duration));
          return <Event key={i} style={{gridRow: `${start} / ${end}`}} event={event}>{event.title}</Event>}
        )}
        </div>
      </div>
    )
  }
}

Calendar = connect(mapStateToProps)(Calendar);

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <FormInput addEvent={addEvent}/>
        <Calendar />
      </Provider>
    </div>
  );
}

export default App;
