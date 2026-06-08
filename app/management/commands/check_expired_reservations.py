from django.core.management.base import BaseCommand
from django.utils import timezone
from app.models import Reservation, ReserveStatus, RoomStatus, Apartment
from datetime import date

class Command(BaseCommand):
    help = 'Check expired reservations and update statuses'

    def handle(self, *args, **options):
        today = date.today()
        expired_reservations = Reservation.objects.filter(
            finaldate__lt=today,
            reservestatus__reservestatusID=1  
        )
        inactive_status = ReserveStatus.objects.get(reservestatusID=2)
        maintenance_status = RoomStatus.objects.get(roomstatusID=3)

        for res in expired_reservations:
            res.reservestatus = inactive_status
            res.save()
    
    
            apt = res.apartment
            apt.roomstatus = maintenance_status
            apt.person = None
            apt.save()
            self.stdout.write(f"Expired reservation {res.reservatioID} for apartment {apt.apartmentID} marked as inactive and maintenance.")

        self.stdout.write(f"Processed {expired_reservations.count()} expired reservations.")