*Content:

1.Introduction -> LINE 17

2.Distinctiveness and complexity -> LINE 40

3.Documentation -> LINE 64

4.What is Contained in Each File -> LINE 133

5.How to run the application -> LINE 202

6.Conclusion -> LINE 335



*Introduction:



 Hi, my name is Muhammad Barakat and this project is the final requirement for the CS50 Web Programming course.



 Real Estate is a single page application that is constructed with Django, JavaScript, HTML & CSS. To achieve the objective of the project, the system organizes residential buildings, individual units (apartments), customers (named persons in this project's content), bookings plus those who use the application, Instead of people organizing this data by hand.



 As a core function, the system allows individuals to create and organize data for buildings, units, customers, bookings but also accounts. For additional utility, the application handles the uploading of images and sends messages via email upon completing some actions like making a new account for example. In the system units have specific statuses that the software manages as well as the software confirms the identity of users. 



 In this document there is a comprehensive description of how the project is designed and how it functions. It contains information about the unique qualities and the difficulty of the work. There are lists for the organization of files and the software that is necessary for the system. For the final section, there are steps that explain how a person can start the application.






*Distinctiveness and Complexity:



 This project is distinct from all previous work in CS50 Web, as a real estate management system, it functions as a single web interface to organize buildings, apartments, residents, reservations and application users. It is not a social network, an e-commerce website or a search engine. To simulate a small scale enterprise system, the application enables a property management company to coordinate information and complete daily operations.

 By focusing on a different problem domain than previous course assignments, this project satisfies the requirement for distinctiveness. In this application, the core focus is on managing property rather than hosting posts, auctions or email messages. The system is a repository for data concerning buildings, apartments, clients, reservations and users. Due to the interaction of those entities through multiple database relationships, the project is structured with a high level of complexity.

 In this project the complexity requirement is satisfied because the implementation is a Single Page Application. As the software functions, it loads one HTML page and uses JavaScript to exchange information with Django API endpoints. Instead of moving between multiple different pages, the interface updates its content when it sends requests to the backend and shows the data that returns. To manage different views, forms, tables plus how users interact with the system, it is necessary to include extra frontend logic that maintains the presence of the user on the same page.

 By examining the reservation workflow, there is another source of complexity. It is not sufficient to insert a row into a database table to create a reservation. When a person creates a reservation, the system is required to verify that the apartment is available. After the system validates the request, it creates a reservation record and automatically changes the status of the apartment so that it is reserved. And the system associates the apartment with the person who is selected and sends an email for confirmation. Due to the need for data consistency, those operations are required to occur together.

 The application contains a specific system for the authentication of users. New users are able to create accounts and enter the application with their credentials. It is the process of the application to hash passwords before it stores them in the database. For any person to access protected API endpoints, they must first verify their identity. By registration, or login, I made the backend more complex than a standard system for data management in this course.

 With the management of images for buildings, the project is further made complex. When users create or update information for buildings, they are able to upload images. To manage those images, the application uses the system in Django that is for media. For this to work it was necessary to set up folders for media and the tools for file uploads. Also, apartments has three status (reservable, reserved, and maintenance), the status changes based on specific actions in reservation proccess.

 Email integration is another important part of the project. The application communicates with the gmail SMTP server to send real emails to users. Emails are sent during user registration, user creation, user deletion and reservation confirmation. The implementation of this functionality required the configuration of email services, the handling of failures and the integration of email operations into different workflows throughout the application. One of the most unique features of the project is the custom Django management command "check_expired_reservations". This command can be executed through the VS terminal and automatically check the final date of the reservation. When an expired reservation is found, the system updates the reservation status to inactive and the apartment status to "maintenance". This simulates a real business process in which apartments require inspection or maintenance before being available again. The implementation of custom management commands was not required in previous CS50 projects and significantly contributed to the complexity of the project.

 Finally, the project contains many interconnected components that must work together correctly. Database models, API endpoints, authentication, email notifications, image uploads, CRUD implementation, reservation management, apartment status tracking and management commands are integrated into one application. For these reasons, I believe that the project meets the unique and complex requirements of the final project for CS50 Web. Is this application considered smaller in scale for some organizations? yes, but it combines a lot of things that make it complex enough.





*Documentation:

 During the time when I developed this project, I went through five main stages, those stages are the design of the database, the development of the backend, the testing of the backend, the development of the frontend, and the final testing.

1.Database design:

 In the first step, I created the structure for the Django project, this structure contains a folder for the main project(real_estate) and a folder for the application (app). After I established the project, I designed the database models:

users, auildings, apartments, roomStatus, persons, reservations, and reserveStatus.

 To create the database schema, I generated/applied migrations after I defined the models and how they relate to each other (in models.py). By registering the models in the Django admin panel (admin.py), I was able to look at records and check relationships. And I used this panel to test the database. 

2.development of the backend:

 in this phase, I created the API endpoints and the logic that runs the application. I performed the majority of the programming tasks within views.py, and urls.py:


-Users are able to register and login to the application. 

-As a security measure, I included authentication for protected endpoints.
 
-abilities to create, update, delete and view (CRUD) for buildings, apartments, users, persons (clients/residents), and reservations.
 
-managing the apartments, the system allows users to create, modify, delete and see the status of each apartment.
 
-by using the upload feature, users can add and change images of buildings.
 
-built features to manage client's data.
 
-in the reservation section, users are able to create, list, update as well as delete reservations.
 
-it is possible for the system to update the status of an apartment automatically when a user creates or modifies a reservation.

-the application sends email notifications when a user registers or performs some actions (like registeration, creating a new user, deleting a user, and creating a reservation (in this one, the email will be sent to the client and not the user). The emails will be located in the spam folder.

-search tool, users can find/search for specific user accounts, people, etc in the application. 



3.Backend testing:

 When the backend implementation was complete, I tested every API endpoint individually so that I could confirm they function as intended. In this process I verified the authentication systems and checked that the CRUD operations work. To ensure the system is working, I tested the reservation workflows and examined the image upload features. And I confirmed that the email notifications reach their destinations.



4.Frontend development:

 The frontend is a Single Page Application, it is a system where the application remains on one page and updates the content with JavaScript & API requests instead of using many HTML pages.

 During this part of the project, I divided the frontend into specific files, an index.html file for the structure of the page, and the visual design, there is a style.css file, and script.js is the file for the logic of the application and the communication with the backend.

 As part of the design, I built tables, forms, buttons and navigation menu, those components change size according to the screen. For the layouts I made them accessible on mobile devices. Due to the use of CSS media queries, the interface is easy to use on small screens.



5.Final testing:



 Testing the full program as an end use, To ensure that all elements of the system worked together as intended.



 I also checked reservation expiration scenarios using the custom Django management command to make sure that the statuses of the apartments and reservations were automatically updated when the reservations expired.





*What is Contained in Each File:


1.real_estate/app/models.py:

 Every database model the program uses is contained in this file. It sets the structure of buildingss, apartments, persons, reservations, users, status, etc. Using Django foreign keys, it also defines the links between these objects.

2.real_estate/app/views.py:

 This file contains the basic backend logic of the program. It handles the requests, validates user input, communicates with the database models, offers replies, sends emails, handles authentication, and executes business logic related to reservations.

3.real_estate/app/urls.py:

 This file specifies all application API routes and connects every URL endpoint to its view function.

4.real_estate/real_estate/settings.py:

 The project setup settings are included in this paper. It was modified in this project to configure the gmail SMTP settings for sending emails, static files, and image uploads.

5.real_estate/real_estate/urls.py:

 This file contains the main URL configuration for the Django project. For development, it arranges media file delivery and links the program URLs to the project.


6.real_estate/app/admin.py:

 In this file, the models of the program are registered with Django's admin panel (used during testing).


7.real_estate/app/management/commands/check_expired_reservations.py:

 This document contains a customized Django management command designed to search for reservations past their expiration. Once the reservation's due date has passed, the command marks it as inactive, updates the flat status to maintenance, removes the present resident company from the reservation, and saves the corrected information. can execute the command manually in VS terminal via:

"python manage.py check_expired_reservations"


8.real_estate/app/templates/app/index.html:

This file contains the main HTML structure of the Single Page Application. It contains the navigation bar, page container, modal components etc.


9.real_estate/app/static/css/style.css:

 Every component of styling the program employs is included in this file. It defines the structure, navigation bar, forms, tables, buttons, responsive design principles, modal styling, and mobile friendly styling.


10.real_estate/app/static/js/script.js:


 This file holds most of frontend logic of the application. It is in charge of handling the communication between the frontend and the backend API endpoint, dynamic page rendering ,  and Single Page Application (SPA) implementation, reservation workflow, dashboard update, etc.


11.real_estate/requirements.txt:




 The Python packages/other things that are needed to be installed before beginning the application (in the first time), they needed to be installed. The content of the .txt file:

1-Django>=4.2,<5.1

2-Pillow>=10.0.0,<12







*How to run the application:


NOTE: if you have any issues using the application, then please watch the video:

"https://www.youtube.com/watch?v=LhMUPlz9c4k&t=135s".



-Step 1 :

 instal the needed files/pachages:

pip install -r requirements.txt



-Step 2:

 Database Migrations:

python manage.py migrate




-Optional Step:

 Create a super user to access admin panel if you want
 
python manage.py createsuperuser

The admin panel can be accessed afterwards at "http://127.0.0.1:8000/admin".






-Step 3:

To create a superuser account in order to access Django's admin panel:





-Step 4:

 initial status data  (VERY IMPORTANT) run the commands in VS terminal:

Open the Django shell:

python manage.py shell

Then execute:

from app.models import ReserveStatus, RoomStatus

ReserveStatus.objects.get_or_create(reservestatusID=1)
ReserveStatus.objects.get_or_create(reservestatusID=2)

RoomStatus.objects.get_or_create(roomstatusID=1)
RoomStatus.objects.get_or_create(roomstatusID=2)
RoomStatus.objects.get_or_create(roomstatusID=3)

print("Status records added successfully")
exit()





-Step 5:

 run the application:

python manage.py runserver

after that, the app should work at "http://127.0.0.1:8000", you will see the main dashboard that shows the # of buildings, users, apartments, etc.








-Step 6:


 Using Gmail SMTP, this project is configured to deliver legitimate email alerts. So please you must use 2 real gmails. If you don't feel like using 2 real gmails, the simply go to real_estate\settings.py and change the codes between lines 130 & 139 to:

EMAIL_HOST_USER = os.environ.get('DJANGO_EMAIL_USER', 'your_email@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('DJANGO_EMAIL_PASSWORD', '')

and now you can use fake emails, and the messages will appear at the VS terminal upon registration, creating a new user, deleting a user, and creating a new reservation.






-Step 7:

 Perform the main actions in this application:



1.Register a new user account.

2.Create a new person record.

3.Create a building.

4.Add one or more apartments to the building.

5.Create a reservation for an apartment.

6.View and edit reservations through the reservation management section.

7.Test Expired Reservation Processing:

 A custom Django management command handles the automatic processing of outdated reservations, which is one of the application's capabilities. To do this:

Make a new or change a reservation expiration date to an old one, execute the command below in the VS terminal:

python manage.py check_expired_reservations

this will reservation from active to inactive. the apartment's status will change from reserved to maintenence, the person in this reservation will get removed, and you can change the status of the apartment from maintenence to reservable in the building/apartments section.



*Conclusion:

 The CS50 team is appreciated for creating a demanding and intriguing curriculum. Learning and experiencing all the course had to offer was invaluable, and I had the ideal chance to apply all of my acquired knowledge in one assignment. Thank you all for the hard work and endless efforts.






