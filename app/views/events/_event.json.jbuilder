json.extract! event, :id, :title
json.start event.start.to_datetime
json.end event.end.to_datetime