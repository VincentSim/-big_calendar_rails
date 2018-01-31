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
