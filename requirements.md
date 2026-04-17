Create an ott platform with svelte. 

## Tech Stack:
1. SvelteKit
2. shadcn-svelte - dark theme full application
3. postgresql and drizzle ORM
4. auth.js with google signin only

## High level components:
1. Admin dashboard - /admin
    - only visible to editors, admins and super admins
2. OTT website - /
    - visible to all

## Admin Dashboard
Purpose: CMS for admins to add new movies or episodes
1. Add new genres - name
2. Add new movies - name, description, duration, release date, poster image, video file, subtitle file, published status(draft, published)
3. Add new series - name, description, poster image, published status(draft, published)
    3.1. Add new episodes - name, season number, description, duration, release date, poster image, video file, subtitle file, published status(draft, published)
4. Add new editor - name, email, password
    4.1. Assign permissions to editor - edit movies, edit series, edit episodes
5. Add new admin - name, email, password
    5.1. Assign permissions to admin - edit movies, edit series, edit episodes, edit genres, edit editor
6. Super admin - name, email, password - set as gowthamprakaash@gmail.com
    5.1. Assign permissions to super admin - edit movies, edit series, edit episodes, edit genres, edit editor, edit admin

## OTT website
1. Home page
    1.1. Featured movies
    1.2. Featured series
    1.3. Trending movies
    1.4. Trending series
    1.5. Recently added movies
    1.6. Recently added series
2. Movies page
    2.1. List of all movies - pagination
    2.2. Filter by genre
3. Series page
    3.1. List of all series - pagination
    3.2. Filter by genre
4. Genres page
    4.1. List of all genres
5. Search page
    5.1. Search by movie name
    5.2. Search by series name
6. Watch page
    6.1. Watch movie - show name, description, duration, etc and video and subtitle
    6.2. Watch series - show name, description, duration, etc and seasons dropdown and episodes list
        6.2.1. Watch episode - show name, season number, episode number, description, duration, etc and video and subtitle
7. Profile page
    7.1. Profile
    7.2. Watch history
    7.3. Watchlist
    7.4. Settings
    7.5. Logout
    7.6. Subscription page
        7.6.1. Subscribe or show current subscription validity
        7.6.2. Payment history

## Payment
- Use Razorpay for payment processing, create needed webhook endpoints and database tables for payment history and settings
- price: 99 rupees per month
- only people who are subscribed/admins/superadmins can watch the videos, others will see an message in the place of video player asking to subscribe


## Storage
Files should be stored in local system storage
Use a separate service to serve the files
    - should we use a separate service to serve the video files or let the webapp serve them directly?
    - if so, what is the best way to do this?

## Deployment
Create a docker file and/or docker-compose.yml file for the project,
1. webapp
2. postgres
3. volumes for files and postgres
4. file service(what to use for this)(should we?)
Automate creation of the artifact(image and/or compose) that can be used anywhere(linux/windows/mac)

## Tracking
Track all changes, uploads, edits done in admin dashboard including movies, series, editors, admins, etc.
