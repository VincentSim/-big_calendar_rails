Rails.application.routes.draw do
  get 'events/create'

  root to: 'pages#calendar'

  resources :events

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
