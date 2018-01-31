# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Event.destroy_all

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