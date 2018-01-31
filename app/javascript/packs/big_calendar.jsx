import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import { Component } from 'react';

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer


const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

  function reviver(key, value) {
      if (typeof value === "string" && dateFormat.test(value)) {
          return new Date(value);
      }

      return value;
  }

export default class MyCalendar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: this.props.calendar.events,
      event_id:null,
      event_start_on: null,
      event_end_on:null,
      event_title: null
    };
  }
  render() {
    return(
      <div>
        <BigCalendar
          events={this.state.events}
          defaultView='week'
          views={['week']}
          selectable
          step={60}
          timeevents={1}
          onSelectEvent={event => this.openModal(event)}
          onSelectSlot={(slotInfo) => this.openModal(slotInfo)}
            />
          <div className="modal fade" id="event-form">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Disponibility</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p>from : {this.state.event_start_on ? this.state.event_start_on.toLocaleString():''}</p>
                  <p>to : {this.state.event_end_on ? this.state.event_end_on.toLocaleString():''}</p>

                  <form>
                   <label>
                      Title
                    </label>
                    <input type="text" name="title" onChange={this.handleInputChange} />
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-success" onClick={this.createEvent}>Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
  createEvent = (element) => {
    Rails.ajax({
      type: 'POST',
      data: 'event[id]='+this.state.event_id+'&event[start]='+this.state.event_start_on+'&event[end]='+this.state.event_end_on+'&event[title]='+this.state.event_title,
      url: '/events',
      success: (element) => {
        var answer = JSON.parse(JSON.stringify(element), reviver);
        this.setState({ events:answer.events})
      }
    });
    this.toggleModal()
  }

   handleInputChange = (e) => {
    this.setState({
      event_title: e.target.value
    })
  }

  openModal = (element) => {
    this.setState({
      event_id: element.id ? element.id : null,
      event_start_on: element.start,
      event_end_on:element.end
    })
    this.toggleModal()
  }

  toggleModal = () => {
    const form = $('#event-form');
    form.modal('toggle');
  }

}


const eventsContainer = document.getElementById('events');
if (eventsContainer) {
  const calendar = JSON.parse(eventsContainer.dataset.events, reviver);
  console.log(calendar.events);
  ReactDOM.render(
    <MyCalendar calendar= {calendar}/>
    , eventsContainer);
}


// scroll to see time.now()
const d = new Date();
const n = d.getHours();

document.getElementsByClassName('rbc-time-content')[0].scrollTop = ((n-1)*40);