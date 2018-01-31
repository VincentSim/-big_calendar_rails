class PagesController < ApplicationController
  def calendar
    @events = Event.all
  end
end
