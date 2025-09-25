## To-Do List Application
https://a3-colinlemire-production.up.railway.app/
---

- My app is an extension of the application I made for assignment 2. It is a to-do list that keeps a to-do list for each individual account that logs into the website. First, the website will not let you start until you log in. There is a log in button in the top right that allows users to sign up with their own email and password, or through Github (both options work). The authentication method is Auth0, which I used because I wanted to get the technical achievement. I'm glad I gave myself a full day to work on this project, because even though I briefly worked with Auth0 in CS3733, it still took a very long time to figure out. This Youtube video helped out a lot though: https://www.youtube.com/watch?v=HTjfDUm1RsU. 

- Once logged in, there is a form that can be filled out where the fields are clearly labeled: Task (where the task you need to do is described), priority (how important is the task) and creation date (the date that the task was added to the to-do list). There is a derived field, the deadline, which takes the creation date and the priority to calculate when the task should be finished by - 3 days in the future for high priority, 7 days for medium priority, and 14 days for low priority. When the button is clicked, the to-do is added to the database for that user and that user only. 

- Once the data populates in the to-do list, the user can delete the to-do, or modify it by clicking the 'edit' button. Clicking the edit button will populate the form with the info from the task, and the button will change from 'Add To-do' to 'Update To-do'. The user can change any data they like in the form, and when submitted, it will change the data shown on the table to reflect the changes made. The user can only see, edit, and delete their own to-dos. However, in testing, I found that problems can arise if the user is logged in on both a local server and the website. If you plan to test the app locally, make sure to close the tab for the deployed website or log out entirely. 

- The app uses Bootstrap styling, which I chose because I worked with it a lot in CS3733 (I guess I learned a lot in that class) so implementing it was much easier than trying to figure out how to use another framework. The only changes I made to the default bootstrap styling is I kept the styling and font I used from before, since I wanted to keep my color scheme. I also added colors for the priority ratings to match how intense they are - red for high priority, orange for medium, and green for low, mimicking a stop light.

- The app scored a 90 or above in all 4 Lighthouse categories, with SEO being my worst. There is a screenshot attached to the repository, which I thought necessary because SEO was only a 90 and I could see that getting worse from outside factors due to the nature of SEO.

List of middleware used
- **dotenv**: Used to allow the app to access the .env variables.
- **Express**: Used to easily set up server and use middleware functions to handle HTTP requests.
- **Auth0**: Used to set up the login and logout features in this application.

## Technical Achievements
- **Tech Achievement 1**: I used OAuth authentication via the GitHub strategy as well as allowing users to create an account of their own if they prefer using an email and password. This actually helped me test whether the user could see other people's to-dos, since having two accounts I could log in with showed me that users could certainly not see other peoples to-do lists. For the purposes of grading, logging in through Github works (you do not need to make a separate account to use the application). I believe I deserve the full 10 points for giving multiple options on how to login, and for making it possible to log in through Github.
- **Tech Achievement 2**: I used Railway to deploy my website. I initially tried to use Vercel, but I was having issues implementing Auth0 through the service (the login route would go nowhere, but locally it worked). I found Railway by looking through the assignments channel in Slack, and found this website to work much better. It was initially very difficult to figure out how to actually deploy the website (not as straightforward as Render), but once the site was set up, it was much easier to make changes and insert my environmental variables into the site. The site is free for now, but only gives you about 30 days worth of usage. I believe I deserve 5 points for a successful deployment on a website other than Render.

### Design/Evaluation Achievements
- **Design Achievement 1**: I did not attempt any design achievements.