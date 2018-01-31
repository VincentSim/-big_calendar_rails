# React Big Calendar Tutorial

# 1 create your app and install webpack

```bash
rails new \-T — database postgresql \big_calendar_rails
cd big_calendar_rails
```

```ruby
# Gemfile
gem 'webpacker', '~> 3.0'
```
```bash
bundle install
rails webpacker:install
rails webpacker:install:react
```

```bash
yarn add moment
```

```bash
yarn add react-big-calendar
```
# 2 Setup your frontend

```ruby
# Gemfile
gem "bootstrap-sass"
gem "font-awesome-sass"
gem "simple_form"
gem "autoprefixer-rails"
```
```bash
bundle install
rails generate simple_form:install --bootstrap
```

We don't like Rails choices for organizing CSS. Let's use lewagon/rails-stylesheets
```bash
rm -rf app/assets/stylesheets
curl -L https://github.com/lewagon/rails-stylesheets/archive/master.zip > stylesheets.zip
unzip stylesheets.zip -d app/assets && rm stylesheets.zip && mv app/assets/rails-stylesheets-master app/assets/stylesheets
```

Add the css of your calendar

# 3 Use react-big-calendar with an array

Now we need a page to see our calendar.
```bash
rails g controller Pages calendar
```
```ruby
# config/routes.rb
Rails.application.routes.draw do
  root to: 'pages#calendar'
end
```
Create javascript/packs/big_calendar.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

const myEventsList= [
  {
    'title': 'Event 1',
    'startDate': new Date(2018,1,2,8),
    'endDate': new Date(2018,1,2,10)
  },
  {
    'title': 'Event 2',
    'startDate': new Date(2018,1,3,12),
    'endDate': new Date(2018,1,3,15)
  }];

const MyCalendar = props => (
  <div>
    <BigCalendar
      events={myEventsList}
      startAccessor='startDate'
      endAccessor='endDate'
      defaultView='week'
      views={['week']}

    />
  </div>
);


document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <MyCalendar name="React" />,
    document.body.appendChild(document.createElement('div')),
  )
})

```
In your view you have to call the appropriate javascript_pack :
```ruby
# views/panges/calendar.html.erb
<h1>My calendar</h1>


<%= javascript_pack_tag 'big_calendar' %>
```

# 4 The Rail's way

Now what we want is to create a event model and event controller to create events
```bash
rails g model event title:string start:datetime end:datetime
rails g controller Events create
rails db:migrate
```

```ruby
#seeds.rb
event1 = Event.create!({
    title: 'Event 1',
    start: DateTime.new(2018,2,2,8),
    end: DateTime.new(2018,2,2,10)
  })

event2 = Event.create!({
    title: 'Event 2',
    start: DateTime.new(2018,2,3,12),
    end: DateTime.new(2018,2,3,15)
  })

p event1
p event2
```


```ruby
class EventsController < ApplicationController
  def create
    start_on = event_params[:start].gsub("GMT ", "+").to_datetime
    end_on = event_params[:end].gsub("GMT ", "+").to_datetime

    event = Event.create!(start:start_on, end: end_on, title: event_params[:title])

    @events = Event.all
  end

  def index
    @events = Event.all
  end


  private

  def event_params
    params.require(:event).permit(:id, :start, :end, :title)
  end
end
```

```ruby
class PagesController < ApplicationController
  def calendar
    @events = Event.all
  end
end
```

```ruby
#index.json.jbuilder and create.json.jbuilder
json.events do
  json.array! @events do |event|
    json.partial! "events/event", event: event
  end
end
```
```ruby
# _event.html.erb
json.extract! event, :id, :title
json.start event.start.to_datetime
json.end event.end.to_datetime
```
we need to pass data to our view
```ruby
#calendar.html.erb
<h1>My calendar</h1>

<div id="events"
    data-events="<%= render(template: 'events/index.json.jbuilder') %>">
</div>
<%= javascript_pack_tag 'big_calendar' %>

```

and our Component now looks like :

```jsx
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
```

## Have fun !!


sources :
https://learnetto.com/blog/how-to-make-ajax-calls-in-rails-5-1-with-or-without-jquery
https://www.airpair.com/js/jquery-ajax-post-tutorial