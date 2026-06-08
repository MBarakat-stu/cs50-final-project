from django.shortcuts import render
from django.db.models import Q

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import json
from .models import Building, Apartment, RoomStatus, Person, Reservation, ReserveStatus, LogData, User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password

from django.core.mail import send_mail

from django.conf import settings


def index(request):
    return render(request, 'app/index.html')


#login and register-------------------------------------


def login_required(view_func):
    def wrapper(request, *args, **kwargs):
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        try:
            user = User.objects.get(userID=user_id)
            request.logged_in_user = user
        except User.DoesNotExist:
            return JsonResponse({'error': 'Invalid user'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not username or not password or not email:
            return JsonResponse({'error': 'Username, password, and email are required'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered'}, status=400)

        user = User.objects.create(
            username=username,
            password=make_password(password),
            email=email
        )

        try:
            send_mail(
                'Registration Successful',
                f'Hello {username},\n\nYour registration was successful. Welcome to Real Estate SPA!',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending failed: {e}")

        return JsonResponse({'message': 'Registration successful. You can now log in.'}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body)
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if not username_or_email or not password:
            return JsonResponse({'error': 'Username/email and password are required'}, status=400)

        user = User.objects.filter(username=username_or_email).first()
        if not user:
            user = User.objects.filter(email=username_or_email).first()

        if not user:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)

        if not check_password(password, user.password):
            return JsonResponse({'error': 'Invalid credentials'}, status=400)

        return JsonResponse({
            'message': 'Login successful',
            'userID': user.userID,
            'username': user.username,
            'email': user.email
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


#---------------------------------------------------------


#person screen codes:----------------------------------


@csrf_exempt
@require_http_methods(["GET"])
@login_required
def listpersons(request):
    persons = Person.objects.all().values(
        'personID', 'fname', 'lname', 'email', 'phonenumber', 'nationalid',
        'birthdate', 'martialstatus'
    )
    data = []
    for p in persons:
        p['birthdate'] = p['birthdate'].isoformat() if p['birthdate'] else None
        data.append(p)
    return JsonResponse(data, safe=False)


@csrf_exempt
@require_http_methods(["GET"])
@login_required
def search4person(request):
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse({'error': 'Search query required'}, status=400)
    persons = Person.objects.filter(
        Q(fname__icontains=query) | Q(lname__icontains=query) | Q(email__icontains=query) | Q(phonenumber__icontains=query) | Q(nationalid__icontains=query)
    ).values('personID', 'fname', 'lname', 'email', 'phonenumber', 'nationalid')
    return JsonResponse(list(persons), safe=False)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def addperson(request):
    try:
        data = json.loads(request.body)
        fname = data.get('fname')
        lname = data.get('lname')
        email = data.get('email')
        phonenumber = data.get('phonenumber')
        nationalid = data.get('nationalid')
        birthdate = data.get('birthdate', '1900-01-01')
        martialstatus = data.get('martialstatus', 'unknown')
        if not fname or not lname or not email or not phonenumber or not nationalid:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        if Person.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        person = Person.objects.create(
            fname=fname,
            lname=lname,
            email=email,
            phonenumber=phonenumber,
            nationalid=nationalid,
            birthdate=birthdate,
            martialstatus=martialstatus
        )
        return JsonResponse({'message': 'Person added', 'personID': person.personID}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
@login_required
def deleteperson(request):
    try:
        person_id = request.GET.get('personID')
        if not person_id:
            return JsonResponse({'error': 'personID required'}, status=400)
        person = Person.objects.get(personID=person_id)
        person.delete()
        return JsonResponse({'message': 'Person deleted'}, status=200)
    except Person.DoesNotExist:
        return JsonResponse({'error': 'Person not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@login_required
def update_person(request):
    try:
        data = json.loads(request.body)
        person_id = data.get('personID')
        if not person_id:
            return JsonResponse({'error': 'personID required'}, status=400)
        person = Person.objects.get(personID=person_id)
        if 'fname' in data:
            person.fname = data['fname']
        if 'lname' in data:
            person.lname = data['lname']
        if 'email' in data:
            new_email = data['email']
            if Person.objects.filter(email=new_email).exclude(personID=person_id).exists():
                return JsonResponse({'error': 'Email already exists'}, status=400)
            person.email = new_email
        if 'phonenumber' in data:
            person.phonenumber = data['phonenumber']
        if 'nationalid' in data:
            person.nationalid = data['nationalid']
        if 'birthdate' in data:
            person.birthdate = data['birthdate']
        if 'martialstatus' in data:
            person.martialstatus = data['martialstatus']
        person.save()
        return JsonResponse({'message': 'Person updated', 'personID': person.personID})
    except Person.DoesNotExist:
        return JsonResponse({'error': 'Person not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


#------------------------------------------


#users codes  :--------------------------------------


@csrf_exempt
@require_http_methods(["GET"])
@login_required
def listusers(request):
    users = User.objects.all().values('userID', 'username', 'email')
    return JsonResponse(list(users), safe=False)


@csrf_exempt
@require_http_methods(["GET"])
@login_required
def search4user(request):
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse({'error': 'Search query required'}, status=400)
    users = User.objects.filter(Q(username__icontains=query) | Q(email__icontains=query)).values('userID', 'username', 'email')
    return JsonResponse(list(users), safe=False)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def adduser(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        if not username or not password or not email:
            return JsonResponse({'error': 'Username, password, email required'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username exists'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email exists'}, status=400)
        user = User.objects.create(
            username=username,
            password=make_password(password),
            email=email
        )
        try:
            send_mail(
                'Welcome to Real Estate SPA',
                f'Hello {username},\n\nYour account has been created successfully.\n\nYou can now log in and manage reservations.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending failed for adduser: {e}")
        return JsonResponse({'message': 'User added', 'userID': user.userID}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
@login_required
def deleteuser(request):
    try:
        user_id = request.GET.get('userID')
        if not user_id:
            return JsonResponse({'error': 'userID required'}, status=400)
        user = User.objects.get(userID=user_id)
        username = user.username
        email = user.email
        user.delete()
        try:
            send_mail(
                'Account Deleted',
                f'Hello {username},\n\nYour account at Real Estate SPA has been deleted.\n\nIf you did not request this, please contact support.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending failed for deleteuser: {e}")
        return JsonResponse({'message': 'User deleted'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@login_required
def update_user(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('userID')
        if not user_id:
            return JsonResponse({'error': 'userID required'}, status=400)
        user = User.objects.get(userID=user_id)
        if 'username' in data:
            new_username = data['username']
            if User.objects.filter(username=new_username).exclude(userID=user_id).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            user.username = new_username
        if 'email' in data:
            new_email = data['email']
            if User.objects.filter(email=new_email).exclude(userID=user_id).exists():
                return JsonResponse({'error': 'Email already exists'}, status=400)
            user.email = new_email
        if 'password' in data and data['password']:
            user.password = make_password(data['password'])
        user.save()
        return JsonResponse({'message': 'User updated', 'userID': user.userID})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


#-----------------------------------------------------------------


#buildings & apartments codess: -----------------------------------


def showbuildings(request):
    buildings = Building.objects.all()
    data = []
    for b in buildings:
        data.append({
            'buildingID': b.buildingID,
            'name': b.name,
            'address': b.address
        })
    return JsonResponse(data, safe=False)


def showapartments(request, building_id):
    apartments = Apartment.objects.filter(building_id=building_id).select_related('roomstatus', 'person')
    data = []
    for a in apartments:
        data.append({
            'apartmentID': a.apartmentID,
            'number': a.number,
            'floor': a.floor,
            'rooms': a.rooms,
            'kitchen': a.kitchen,
            'bathroom': a.bathroom,
            'livingroom': a.livingroom,
            'roomstatus': a.roomstatus.roomstatusID if a.roomstatus else None,
            'personID': a.person.personID if a.person else None
        })
    return JsonResponse(data, safe=False)


@csrf_exempt
@login_required
def manage_buildings(request):
    if request.method == "GET":
        buildings = Building.objects.all()
        data = []
        for b in buildings:
            pic_url = None
            if b.picture:
                pic_url = request.build_absolute_uri(b.picture.url)
            data.append({
                'buildingID': b.buildingID,
                'name': b.name,
                'address': b.address,
                'picture': pic_url
            })
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        name = request.POST.get('name')
        address = request.POST.get('address')
        picture = request.FILES.get('picture')
        if not name or not address:
            return JsonResponse({'error': 'Name and address required'}, status=400)
        building = Building.objects.create(name=name, address=address, picture=picture)
        return JsonResponse({'message': 'Building added', 'buildingID': building.buildingID}, status=201)

    elif request.method == "PUT":
        data = json.loads(request.body)
        building_id = data.get('buildingID')
        if not building_id:
            return JsonResponse({'error': 'buildingID required'}, status=400)
        try:
            building = Building.objects.get(buildingID=building_id)
            building.name = data.get('name', building.name)
            building.address = data.get('address', building.address)
            building.save()
            return JsonResponse({'message': 'Building updated'})
        except Building.DoesNotExist:
            return JsonResponse({'error': 'Building not found'}, status=404)

    elif request.method == "DELETE":
        building_id = request.GET.get('buildingID')
        if not building_id:
            return JsonResponse({'error': 'buildingID required'}, status=400)
        try:
            building = Building.objects.get(buildingID=building_id)
            building.delete()
            return JsonResponse({'message': 'Building deleted'})
        except Building.DoesNotExist:
            return JsonResponse({'error': 'Building not found'}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def update_building_picture(request):
    building_id = request.POST.get('buildingID')
    picture = request.FILES.get('picture')
    if not building_id or not picture:
        return JsonResponse({'error': 'buildingID and picture required'}, status=400)
    try:
        building = Building.objects.get(buildingID=building_id)
        building.picture = picture
        building.save()
        return JsonResponse({'message': 'Picture updated'})
    except Building.DoesNotExist:
        return JsonResponse({'error': 'Building not found'}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def make_apartment_reservable(request):
    try:
        data = json.loads(request.body)
        apartment_id = data.get('apartmentID')
        if not apartment_id:
            return JsonResponse({'error': 'apartmentID required'}, status=400)

        apartment = Apartment.objects.get(apartmentID=apartment_id)
        if not apartment.roomstatus or apartment.roomstatus.roomstatusID != 3:
            return JsonResponse({'error': 'Apartment is not in maintenance'}, status=400)

        reservable_status = RoomStatus.objects.get(roomstatusID=1)
        apartment.roomstatus = reservable_status
        apartment.person = None
        apartment.save()

        return JsonResponse({'message': 'Apartment is now reservable'})

    except Apartment.DoesNotExist:
        return JsonResponse({'error': 'Apartment not found'}, status=404)
    except RoomStatus.DoesNotExist:
        return JsonResponse({'error': 'Reservable status not found'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def reserve_apartment_management(request):
    try:
        data = json.loads(request.body)
        apartment_id = data.get('apartmentID')
        person_id = data.get('personID')
        person_identifier = data.get('personIdentifier')
        startdate = data.get('startdate')
        finaldate = data.get('finaldate')

        if not apartment_id or not startdate or not finaldate:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        person = None
        if person_id:
            person = Person.objects.filter(personID=person_id).first()
        elif person_identifier:
            person = Person.objects.filter(
                Q(email=person_identifier) | Q(phonenumber=person_identifier) | Q(nationalid=person_identifier)
            ).first()
        if not person:
            return JsonResponse({'error': 'Person not found'}, status=404)

        apartment = Apartment.objects.get(apartmentID=apartment_id)
        if apartment.roomstatus.roomstatusID != 1:
            return JsonResponse({'error': 'Apartment is not reservable'}, status=400)

        active_reserve_status = ReserveStatus.objects.get(reservestatusID=1)
        reserved_room_status = RoomStatus.objects.get(roomstatusID=2)

        reservation = Reservation.objects.create(
            person=person,
            building=apartment.building,
            apartment=apartment,
            startdate=startdate,
            finaldate=finaldate,
            reservestatus=active_reserve_status
        )

        apartment.roomstatus = reserved_room_status
        apartment.person = person
        apartment.save()

        try:
            send_mail(
                'Reservation Confirmed',
                f'Dear {person.fname},\n\nYour reservation for Apartment {apartment.number} in {apartment.building.name} from {startdate} to {finaldate} has been confirmed.\n\nThank you.',
                settings.DEFAULT_FROM_EMAIL,
                [person.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email failed: {e}")

        LogData.objects.create(
            action=f'User {request.logged_in_user.username} reserved apartment {apartment_id} for person {person.personID}',
            user_identifier=request.logged_in_user.email
        )

        return JsonResponse({'message': 'Reservation successful', 'reservationID': reservation.reservatioID}, status=201)

    except Apartment.DoesNotExist:
        return JsonResponse({'error': 'Apartment not found'}, status=404)
    except (ReserveStatus.DoesNotExist, RoomStatus.DoesNotExist):
        return JsonResponse({'error': 'Status configuration missing'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE"])
@login_required
def manage_apartments(request):
    if request.method == "GET":
        building_id = request.GET.get('buildingID')
        if building_id:
            apartments = Apartment.objects.filter(building_id=building_id).select_related('roomstatus', 'person')
        else:
            apartments = Apartment.objects.all().select_related('roomstatus', 'person')
        data = []
        for a in apartments:
            data.append({
                'apartmentID': a.apartmentID,
                'buildingID': a.building.buildingID,
                'number': a.number,
                'floor': a.floor,
                'rooms': a.rooms,
                'kitchen': a.kitchen,
                'bathroom': a.bathroom,
                'livingroom': a.livingroom,
                'roomstatus': a.roomstatus.roomstatusID if a.roomstatus else None,
                'personID': a.person.personID if a.person else None,
                'personName': f"{a.person.fname} {a.person.lname}" if a.person else None,
            })
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        data = json.loads(request.body)
        required = ['buildingID', 'number', 'floor', 'rooms', 'kitchen', 'bathroom', 'livingroom']
        if not all(k in data for k in required):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        try:
            building = Building.objects.get(buildingID=data['buildingID'])
            roomstatus = RoomStatus.objects.get(roomstatusID=1)
            apartment = Apartment.objects.create(
                building=building,
                number=data['number'],
                floor=data['floor'],
                rooms=data['rooms'],
                kitchen=data['kitchen'],
                bathroom=data['bathroom'],
                livingroom=data['livingroom'],
                roomstatus=roomstatus,
                person=None
            )
            return JsonResponse({'message': 'Apartment added', 'apartmentID': apartment.apartmentID}, status=201)
        except (Building.DoesNotExist, RoomStatus.DoesNotExist):
            return JsonResponse({'error': 'Invalid building or room status'}, status=400)

    elif request.method == "PUT":
        data = json.loads(request.body)
        apartment_id = data.get('apartmentID')
        if not apartment_id:
            return JsonResponse({'error': 'apartmentID required'}, status=400)
        try:
            apartment = Apartment.objects.get(apartmentID=apartment_id)
            apartment.number = data.get('number', apartment.number)
            apartment.floor = data.get('floor', apartment.floor)
            apartment.rooms = data.get('rooms', apartment.rooms)
            apartment.kitchen = data.get('kitchen', apartment.kitchen)
            apartment.bathroom = data.get('bathroom', apartment.bathroom)
            apartment.livingroom = data.get('livingroom', apartment.livingroom)
            if 'roomstatus' in data:
                try:
                    roomstatus = RoomStatus.objects.get(roomstatusID=data['roomstatus'])
                    apartment.roomstatus = roomstatus
                except RoomStatus.DoesNotExist:
                    pass
            apartment.save()
            return JsonResponse({'message': 'Apartment updated'})
        except Apartment.DoesNotExist:
            return JsonResponse({'error': 'Apartment not found'}, status=404)

    elif request.method == "DELETE":
        apartment_id = request.GET.get('apartmentID')
        if not apartment_id:
            return JsonResponse({'error': 'apartmentID required'}, status=400)
        try:
            apartment = Apartment.objects.get(apartmentID=apartment_id)
            apartment.delete()
            return JsonResponse({'message': 'Apartment deleted'})
        except Apartment.DoesNotExist:
            return JsonResponse({'error': 'Apartment not found'}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def reserve(request):
    try:
        data = json.loads(request.body)
        apartment_id = data.get('apartmentID')
        person_fname = data.get('fname')
        person_lname = data.get('lname')
        person_email = data.get('email')
        person_phone = data.get('phonenumber')
        startdate = data.get('startdate')
        finaldate = data.get('finaldate')

        apartment = Apartment.objects.get(apartmentID=apartment_id)
        if apartment.roomstatus and apartment.roomstatus.roomstatusID == 2:
            return JsonResponse({'error': 'Apartment already reserved'}, status=400)

        person, created = Person.objects.get_or_create(
            email=person_email,
            defaults={
                'fname': person_fname,
                'lname': person_lname,
                'phonenumber': person_phone,
                'birthdate': '1900-01-01',
                'martialstatus': 'unknown',
                'nationalid': '000000'
            }
        )

        reservable_status = RoomStatus.objects.get(roomstatusID=1)
        reserved_status = RoomStatus.objects.get(roomstatusID=2)
        active_status = ReserveStatus.objects.get(reservestatusID=1)

        reservation = Reservation.objects.create(
            person=person,
            building=apartment.building,
            apartment=apartment,
            startdate=startdate,
            finaldate=finaldate,
            reservestatus=active_status
        )

        apartment.roomstatus = reserved_status
        apartment.person = person
        apartment.save()

        LogData.objects.create(
            action=f'Person {person.personID} reserved apartment {apartment_id} from {startdate} to {finaldate}',
            user_identifier=person.email
        )

        return JsonResponse({'message': 'Reservation successful', 'reservationID': reservation.reservatioID}, status=201)

    except Apartment.DoesNotExist:
        return JsonResponse({'error': 'Apartment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


#----------------------------------------------------------------------------


#reservations ; -----------------------------------------


@csrf_exempt
@require_http_methods(["GET"])
@login_required
def list_all_reservations(request):
    reservations = Reservation.objects.select_related('person', 'building', 'apartment', 'reservestatus').all().order_by('-startdate')
    data = []
    for r in reservations:
        data.append({
            'reservationID': r.reservatioID,
            'personID': r.person.personID,
            'personName': f"{r.person.fname} {r.person.lname}",
            'personEmail': r.person.email,
            'personPhone': r.person.phonenumber,
            'personNationalId': r.person.nationalid,
            'buildingName': r.building.name,
            'apartmentNumber': r.apartment.number,
            'startdate': r.startdate,
            'finaldate': r.finaldate,
            'status': r.reservestatus.reservestatusID if r.reservestatus else None,
            'statusName': 'Active' if (r.reservestatus and r.reservestatus.reservestatusID == 1) else 'Inactive'
        })
    return JsonResponse(data, safe=False)


@csrf_exempt
@require_http_methods(["PUT"])
@login_required
def update_reservation(request):
    try:
        data = json.loads(request.body)
        reservation_id = data.get('reservationID')
        startdate = data.get('startdate')
        finaldate = data.get('finaldate')
        status_id = data.get('statusID')

        if not reservation_id:
            return JsonResponse({'error': 'reservationID required'}, status=400)

        reservation = Reservation.objects.get(reservatioID=reservation_id)
        if startdate:
            reservation.startdate = startdate
        if finaldate:
            reservation.finaldate = finaldate
        if status_id:
            new_status = ReserveStatus.objects.get(reservestatusID=status_id)
            reservation.reservestatus = new_status
            if status_id == 2:
                apt = reservation.apartment
                maintenance_status = RoomStatus.objects.get(roomstatusID=3)
                apt.roomstatus = maintenance_status
                apt.person = None
                apt.save()
        reservation.save()
        return JsonResponse({'message': 'Reservation updated'})
    except Reservation.DoesNotExist:
        return JsonResponse({'error': 'Reservation not found'}, status=404)
    except (ReserveStatus.DoesNotExist, RoomStatus.DoesNotExist):
        return JsonResponse({'error': 'Status configuration missing'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
@login_required
def delete_reservation(request):
    try:
        reservation_id = request.GET.get('reservationID')
        if not reservation_id:
            return JsonResponse({'error': 'reservationID required'}, status=400)
        reservation = Reservation.objects.get(reservatioID=reservation_id)
        apt = reservation.apartment
        maintenance_status = RoomStatus.objects.get(roomstatusID=3)
        apt.roomstatus = maintenance_status
        apt.person = None
        apt.save()
        reservation.delete()
        return JsonResponse({'message': 'Reservation deleted'})
    except Reservation.DoesNotExist:
        return JsonResponse({'error': 'Reservation not found'}, status=404)
    except RoomStatus.DoesNotExist:
        return JsonResponse({'error': 'RoomStatus not found'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def showreservations(request):
    identifier = request.GET.get('identifier')
    if not identifier:
        return JsonResponse({'error': 'Please provide email, phone, or national ID'}, status=400)

    person = Person.objects.filter(
        Q(email=identifier) | Q(phonenumber=identifier) | Q(nationalid=identifier)
    ).first()

    if not person:
        return JsonResponse({'error': 'No person found with that information'}, status=404)

    reservations = Reservation.objects.filter(
        person=person,
        reservestatus__reservestatusID=1
    ).select_related('building', 'apartment')

    data = []
    for r in reservations:
        data.append({
            'reservationID': r.reservatioID,
            'building': r.building.name,
            'apartment_number': r.apartment.number,
            'startdate': r.startdate,
            'finaldate': r.finaldate,
            'status': 'active'
        })

    return JsonResponse(data, safe=False)


#-------------------------------------------------------



