json.events do
  json.array! @events do |event|
    json.partial! "events/event", event: event
  end
end