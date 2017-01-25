class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  respond_to :js, :html
  helper_method :get_swell_json_with_spot_id, :get_json
  require 'net/http'

  before_filter :configure_permitted_parameters, if: :devise_controller?
  def get_json(url)
    uri = URI.parse(url)
    response = Net::HTTP.get_response(uri)
    data = response.body
    begin
      result = JSON.parse(data)
    rescue
      result = "fail"
    end
    return result
  end

  def get_swell_json_with_spot_id(id)
    get_json('http://magicseaweed.com/api/9g81Jsvjt2EaR7Xf3L5L7dIQd7c97EUI/forecast/?spot_id=' +id.to_s)
  end
 
  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up)        { |u| u.permit(:username, :email, :password, :password_confirmation, :remember_me) }
    devise_parameter_sanitizer.permit(:sign_in)        { |u| u.permit(:login, :username, :email, :password, :remember_me) }
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:username, :email, :password, :password_confirmation, :current_password) }
  end

  private

  def require_user_signed_in
    unless user_signed_in?

      # If the user came from a page, we can send them back.  Otherwise, send
      # them to the root path.
      if request.env['HTTP_REFERER']
        fallback_redirect = :back
      elsif defined?(root_path)
        fallback_redirect = root_path
      else
        fallback_redirect = "/"
      end

      redirect_to fallback_redirect, flash: {error: "You must be signed in to view this page."}
    end
  end

end
