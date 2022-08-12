const application_details = {
  back_to_applications: 'Back to Applications',
  check_guide: 'Check Guide',
  advanced_settings: 'Advanced settings',
  application_name: 'Application name',
  application_name_placeholder: 'My App',
  description: 'Description',
  description_placeholder: 'Enter your application description',
  authorization_endpoint: 'Authorization endpoint',
  authorization_endpoint_tip:
    "The endpoint to perform authentication and authorization. It's used for OpenID Connect Authentication.",
  application_secret: 'App Secret',
  redirect_uri: 'Redirect URI',
  redirect_uris: 'Redirect URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'The URI redirects after a user sign-in (whether successful or not). See OpenID Connect AuthRequest for more info.',
  post_sign_out_redirect_uri: 'Post Sign-out Redirect URI',
  post_sign_out_redirect_uris: 'Post Sign-out Redirect URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'The URI redirects after a user sign-out (optional). It may have no practical effect in some app types.',
  cors_allowed_origins: 'CORS allowed origins',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'By default, all the origins of Redirect URIs will be allowed. Usually no action is required for this field.',
  add_another: 'Add Another',
  id_token_expiration: 'ID Token expiration',
  refresh_token_expiration: 'Refresh Token expiration',
  token_endpoint: 'Token endpoint',
  user_info_endpoint: 'Userinfo endpoint',
  delete_description:
    'This action cannot be undone. It will permanently delete the application. Please enter the application name <span>{{name}}</span> to confirm.',
  enter_your_application_name: 'Enter your application name',
  application_deleted: 'Application {{name}} has been successfully deleted',
  redirect_uri_required: 'You must enter at least one redirect URI',
};

export default application_details;
