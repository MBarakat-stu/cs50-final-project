from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/buildings/', views.showbuildings, name='showbuildings'),
    path('api/apartments/<int:building_id>/', views.showapartments, name='showapartments'),
    path('api/reserve/', views.reserve, name='reserve'),
    path('api/showreservations/', views.showreservations, name='showreservations'),
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login, name='login'),
    path('api/listusers/', views.listusers, name='listusers'),
    path('api/listpersons/', views.listpersons, name='listpersons'),
    path('api/search4user/', views.search4user, name='search4user'),
    path('api/search4person/', views.search4person, name='search4person'),
    path('api/adduser/', views.adduser, name='adduser'),
    path('api/deleteuser/', views.deleteuser, name='deleteuser'),
    path('api/addperson/', views.addperson, name='addperson'),
    path('api/deleteperson/', views.deleteperson, name='deleteperson'),
    path('api/manage_buildings/', views.manage_buildings, name='manage_buildings'),
    path('api/manage_apartments/', views.manage_apartments, name='manage_apartments'),
    path('api/reserve_apartment_management/', views.reserve_apartment_management, name='reserve_apartment_management'),
    path('api/make_apartment_reservable/', views.make_apartment_reservable, name='make_apartment_reservable'),
    path('api/list_all_reservations/', views.list_all_reservations, name='list_all_reservations'),
    path('api/update_reservation/', views.update_reservation, name='update_reservation'),
    path('api/delete_reservation/', views.delete_reservation, name='delete_reservation'),
    path('api/update_user/', views.update_user, name='update_user'),
    path('api/update_person/', views.update_person, name='update_person'),
    path('api/update_building_picture/', views.update_building_picture, name='update_building_picture'),
    

    
]