-Content:


*Introduction: line 

*Distinctiveness and Complexity: line

*Documentation: line

*What’s contained in each file: line

*Requirments: line

*How to run the application: line

*Conclusion: line





-Introduction:

 Hi
I am Muhammad Barakat, I created this Django app, which is a single page application (SPA)
about a real estate managment system, where you can creat users, clients, buildings, 
apartment and manage them, and of course, make reservations.

In this file, you will learn (almost) everything about this app, from how it was 
created, to how to run it.




-Distinctiveness and Complexity:

 This project is diffrent from all 5 project I have made in cs50 web, it is not an e-commerce, social app, or a search engine replica, unlike them, it is an enterprise web application, which is  a large-scale, browser-accessible software platform built to support complex business operations and organizational workflows (although, this project is at a lower scale). I learned how to make such an app durring my college internship.

 In this app "Real Estate" (as it's name says), it is a system where you can manage buildings, apartments, and the people who live in them.
You can performe CRUD (add, delete, update, etc) to buildings, apartments, users, etc.


 Also, upon performing some actions, an actual email is suppose to be sent to actual email users (you will learn more regarding the matter 
durring "How to run the application" section in this file).

 So I do belive all of this is enogh to prove that this application is diffrent and uniqe from the rest of the projects in this course.





-Documentation:

*During development, I went through  5 phases:

+Datatbase:

 First, I created the django project folders "real_estate & app". Then I defined the models; User, Building, Apartment, RoomStatus, Person, Reservation, ReserveStatus. And finaly, I migrated the database and registered models in admin so I can access the admin panel and test the database.




+Backend:

 In this phase, I made and worked on the API (mostly the views.py and url.py):

+Created user authentication via register and login.

+Created building & apartment CRUD (including picture upload and editing).

+Created reservation management system (create, list all, update, delete), with email sent on reservation.

+Created users (the actual user of the app) CRUD managment.

+Creater persons (the clients who will reserve the apartments) CRUD managment.

+And som features such as Room status update, and login required feature for protected endpoints.






+Backend Testing:


 This phase was just a casual testing for application to see if the API is working as it was intended before I can
move to the frontend phase.


+Frontend:

 In this pfase I did 2 things:

1-seperated the html,css, and js from eachother, each one store in diffrent file (index.html, style.css, and script.js),
because putting them all in index.html made the performance terrible and also hard to update anything.

2-added style to application via CSS and avascript to make good looking tables, buttons, etc.




+Final Testing:


 Just using the application casually to see if there is any errors that need fixing.



-What’s contained in each file:

*models.py :
located at \final-project\real_estate\app\models.py
Defines the structure of all database tables and relationships (foreign keys, choices, image fields).

*views.py :
located at \final-project\real_estate\app\views.py
Contains backend logic: handling HTTP requests, interacting with models, returning JSON responses, sending emails, etc.

*urls.py :
located at \final-project\real_estate\app\urls.py
Connects each URL path to a specific view function.

*check_expired_reservations.py:
located at \final-project\real_estate\app\management\commands\check_expired_reservations.py
command that can be run manually or scheduled to clean up expired reservations, can run manually via the code "python manage.py check_expired_reservations" in the terminal.

+index.html :
located at \final-project\real_estate\app\templates\app\index.html
Contains HTML code.

+style.css
located at \final-project\real_estate\app\static\css\style.css
Contains CSS code.

+script.js
located at app\static\js\script.js
Contains JS code.




-Requirments:

1-Django>=4.2,<5.1

2-Pillow>=10.0.0,<12


3- 2 real emails to be used upon registeration and creating a person.





-How to run the application:

*NOTE: if you found any hardships of how to operate the app, the please watch the youtube video "https://www.youtube.com/watch?v=LhMUPlz9c4k".

*STEP 0 :

+Install the requirments from above:
pip install -r requirements.txt

*STEP 1: Run database migrations:

python manage.py migrate

STEP 2 : Create a superuser (to access the admin panel if you want at http://127.0.0.1:8000/admin):

python manage.py createsuperuser

STEP 3 : Seed initial status data  (VERY IMPORTANT):

from app.models import ReserveStatus, RoomStatus

ReserveStatus.objects.get_or_create(reservestatusID=1)
ReserveStatus.objects.get_or_create(reservestatusID=2)

RoomStatus.objects.get_or_create(roomstatusID=1)
RoomStatus.objects.get_or_create(roomstatusID=2)
RoomStatus.objects.get_or_create(roomstatusID=3)

print("Status records added successfully")
exit()

STEP 4 :Start the development server:

python manage.py runserver

STEP 5 : register a new user using your real email (you should recive an actual email in your gmail account, if you didn't see it, then check your "spam"), or create a new google email for testing, 

or if you don't want to do all that then simply go to real_estate\settings.py and then replace the the lines from 131 to 138 with the codes:

EMAIL_HOST_USER = os.environ.get('DJANGO_EMAIL_USER', 'your_email@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('DJANGO_EMAIL_PASSWORD', '')

this will make the emails messages to appear in the terminal (even if they were fake emails).


*STEP 6:

creat a new person in persons with a real email.

STEP 7:

craete a new building and add an apartment to it.

STEP 8:

make a reservation in that apartment with the new person you created.

STEP 9:

You now can see the reservation in reservations, and can edit it if you want.

STEP 10 :

now you can see what would happen if the reservation expires, to test that, make a reservation (or edit an already exsisting one ), make the end date an old one (make it yesterday for example), and then in the terminal run the following code:


python manage.py check_expired_reservations



this will turn the room status to maintanance, and you can turn it back to reservable back at buildings page.


*FINALLY:

you can create multiple buildings, apartments, users, persons, reservations, and edit, delete, add to them as much as you want.
again, if you found any hardship in this section then please see the video at :


https://www.youtube.com/watch?v=LhMUPlz9c4k





-Conclusion:

 And that's it, this was an amiazing journey, thank you all for this amazing hard work. I hope our paths cross again in the near future.






