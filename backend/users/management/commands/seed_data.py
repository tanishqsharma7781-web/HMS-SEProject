import os
import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from users.models import StudentProfile, WardenProfile, SecurityProfile
from hostels.models import Hostel, Block, Room, RoomAllocation
from fees.models import Fee, Payment
from food_menu.models import FoodMenu, FoodMenuItem
from complaints.models import Complaint, ComplaintAssignment
from attendance.models import Attendance
from visitors.models import Visitor
from notices.models import Notice, Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed comprehensive realistic demo data for Hostel Management System'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeding...")

        # 1. Clean existing records safely
        Notification.objects.all().delete()
        Notice.objects.all().delete()
        Visitor.objects.all().delete()
        Attendance.objects.all().delete()
        ComplaintAssignment.objects.all().delete()
        Complaint.objects.all().delete()
        FoodMenuItem.objects.all().delete()
        FoodMenu.objects.all().delete()
        Payment.objects.all().delete()
        Fee.objects.all().delete()
        RoomAllocation.objects.all().delete()
        Room.objects.all().delete()
        Block.objects.all().delete()
        Hostel.objects.all().delete()
        SecurityProfile.objects.all().delete()
        WardenProfile.objects.all().delete()
        StudentProfile.objects.all().delete()
        User.objects.all().delete()

        # 2. Create Users
        # Admin
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@hms.edu',
            password='adminpassword123',
            first_name='System',
            last_name='Administrator',
            role='ADMIN',
            phone='+91 9876543210'
        )
        self.stdout.write("Created Admin: admin / adminpassword123")

        # Wardens
        warden1 = User.objects.create_user(
            username='warden.sharma',
            email='sharma@hms.edu',
            password='wardenpassword123',
            first_name='Ramesh',
            last_name='Sharma',
            role='WARDEN',
            phone='+91 9811223344'
        )
        wp1 = WardenProfile.objects.create(
            user=warden1,
            employee_id='WRD-2020-01',
            qualification='M.Sc, Ph.D in Physics',
            emergency_contact='+91 9811223399'
        )

        warden2 = User.objects.create_user(
            username='warden.patel',
            email='patel@hms.edu',
            password='wardenpassword123',
            first_name='Sunita',
            last_name='Patel',
            role='WARDEN',
            phone='+91 9822334455'
        )
        wp2 = WardenProfile.objects.create(
            user=warden2,
            employee_id='WRD-2021-02',
            qualification='M.A., M.Ed Counselor',
            emergency_contact='+91 9822334488'
        )
        self.stdout.write("Created Wardens: warden.sharma, warden.patel")

        # Security
        sec1 = User.objects.create_user(
            username='security.singh',
            email='singh@hms.edu',
            password='securitypassword123',
            first_name='Vikram',
            last_name='Singh',
            role='SECURITY',
            phone='+91 9833445566'
        )
        SecurityProfile.objects.create(
            user=sec1,
            employee_id='SEC-2022-01',
            shift='Day',
            gate_number='Main Campus Gate 1'
        )

        sec2 = User.objects.create_user(
            username='security.kumar',
            email='kumar@hms.edu',
            password='securitypassword123',
            first_name='Rajesh',
            last_name='Kumar',
            role='SECURITY',
            phone='+91 9844556677'
        )
        SecurityProfile.objects.create(
            user=sec2,
            employee_id='SEC-2023-02',
            shift='Night',
            gate_number='Hostel South Gate 2'
        )
        self.stdout.write("Created Security Staff: security.singh, security.kumar")

        # Hostels, Blocks, Rooms
        hostel = Hostel.objects.create(
            name='APJ Abdul Kalam Premier Hostel Campus',
            code='KIC-MAIN',
            address='North University Enclave, Knowledge City, New Delhi - 110001',
            total_floors=3,
            warden_in_charge=warden1
        )

        block_a = Block.objects.create(
            hostel=hostel,
            name='Block A (Aryabhata Block)',
            code='BLK-A',
            gender_type='BOYS',
            total_rooms=12,
            warden=warden1
        )
        wp1.assigned_block = block_a
        wp1.save()

        block_b = Block.objects.create(
            hostel=hostel,
            name='Block B (Gargi Block)',
            code='BLK-B',
            gender_type='GIRLS',
            total_rooms=12,
            warden=warden2
        )
        wp2.assigned_block = block_b
        wp2.save()

        block_c = Block.objects.create(
            hostel=hostel,
            name='Block C (Tagore PG Block)',
            code='BLK-C',
            gender_type='COED',
            total_rooms=8,
            warden=warden1
        )

        # Rooms in Block A
        rooms_a = {}
        for f in [1, 2]:
            for r in [1, 2, 3, 4]:
                r_num = f"{f}0{r}"
                cap = 2 if r <= 3 else 1
                rtype = 'DOUBLE' if cap == 2 else 'SINGLE'
                fee = 35000.00 if cap == 2 else 48000.00
                room_obj = Room.objects.create(
                    block=block_a,
                    room_number=r_num,
                    floor=f,
                    room_type=rtype,
                    capacity=cap,
                    fee_per_semester=fee,
                    notes=f"Floor {f} standard room with attached balcony and study desk"
                )
                rooms_a[r_num] = room_obj

        # Rooms in Block B
        rooms_b = {}
        for f in [1, 2]:
            for r in [1, 2, 3, 4]:
                r_num = f"{f}0{r}"
                cap = 2 if r <= 3 else 1
                rtype = 'DOUBLE' if cap == 2 else 'SINGLE'
                fee = 35000.00 if cap == 2 else 48000.00
                room_obj = Room.objects.create(
                    block=block_b,
                    room_number=r_num,
                    floor=f,
                    room_type=rtype,
                    capacity=cap,
                    fee_per_semester=fee,
                    notes=f"Block B Floor {f} room with modern amenities"
                )
                rooms_b[r_num] = room_obj

        # Rooms in Block C
        for f in [1]:
            for r in [1, 2, 3]:
                r_num = f"{f}0{r}"
                Room.objects.create(
                    block=block_c,
                    room_number=r_num,
                    floor=f,
                    room_type='SINGLE',
                    capacity=1,
                    fee_per_semester=52000.00,
                    notes="Premium PG scholar studio room"
                )

        self.stdout.write("Created Hostels, Blocks, and Rooms.")

        # 3. Create Students
        students_data = [
            {
                'username': 'student.aarav',
                'name': ('Aarav', 'Mehta'),
                'email': 'aarav.mehta@student.hms.edu',
                'phone': '+91 9900112233',
                'student_id': 'STU-2024-001',
                'dept': 'Computer Science & Engineering',
                'course': 'B.Tech CSE',
                'year': 3,
                'gender': 'Male',
                'blood': 'O+',
                'parent_name': 'Sanjay Mehta',
                'parent_phone': '+91 9911002200',
                'room': rooms_a['101'],
                'bed': 'Bed 1'
            },
            {
                'username': 'student.rohan',
                'name': ('Rohan', 'Gupta'),
                'email': 'rohan.gupta@student.hms.edu',
                'phone': '+91 9911223344',
                'student_id': 'STU-2024-002',
                'dept': 'Electronics & Communication',
                'course': 'B.Tech ECE',
                'year': 3,
                'gender': 'Male',
                'blood': 'B+',
                'parent_name': 'Manoj Gupta',
                'parent_phone': '+91 9922003311',
                'room': rooms_a['101'],
                'bed': 'Bed 2'
            },
            {
                'username': 'student.ananya',
                'name': ('Ananya', 'Iyer'),
                'email': 'ananya.iyer@student.hms.edu',
                'phone': '+91 9922334455',
                'student_id': 'STU-2024-003',
                'dept': 'Information Technology',
                'course': 'B.Tech IT',
                'year': 2,
                'gender': 'Female',
                'blood': 'A+',
                'parent_name': 'Venkat Iyer',
                'parent_phone': '+91 9933004422',
                'room': rooms_b['201'],
                'bed': 'Bed 1'
            },
            {
                'username': 'student.priya',
                'name': ('Priya', 'Nair'),
                'email': 'priya.nair@student.hms.edu',
                'phone': '+91 9933445566',
                'student_id': 'STU-2024-004',
                'dept': 'Mechanical Engineering',
                'course': 'B.Tech ME',
                'year': 2,
                'gender': 'Female',
                'blood': 'AB+',
                'parent_name': 'Gopal Nair',
                'parent_phone': '+91 9944005533',
                'room': rooms_b['201'],
                'bed': 'Bed 2'
            },
            {
                'username': 'student.kabir',
                'name': ('Kabir', 'Verma'),
                'email': 'kabir.verma@student.hms.edu',
                'phone': '+91 9944556677',
                'student_id': 'STU-2024-005',
                'dept': 'Civil Engineering',
                'course': 'B.Tech Civil',
                'year': 1,
                'gender': 'Male',
                'blood': 'O-',
                'parent_name': 'Alok Verma',
                'parent_phone': '+91 9955006644',
                'room': rooms_a['102'],
                'bed': 'Bed 1'
            },
            {
                'username': 'student.sneha',
                'name': ('Sneha', 'Reddy'),
                'email': 'sneha.reddy@student.hms.edu',
                'phone': '+91 9955667788',
                'student_id': 'STU-2024-006',
                'dept': 'Biotechnology',
                'course': 'B.Tech Biotech',
                'year': 1,
                'gender': 'Female',
                'blood': 'B-',
                'parent_name': 'Kalyan Reddy',
                'parent_phone': '+91 9966007755',
                'room': rooms_b['202'],
                'bed': 'Bed 1'
            },
            {
                'username': 'student.arjun',
                'name': ('Arjun', 'Das'),
                'email': 'arjun.das@student.hms.edu',
                'phone': '+91 9966778899',
                'student_id': 'STU-2024-007',
                'dept': 'Data Science & AI',
                'course': 'M.Tech AI',
                'year': 1,
                'gender': 'Male',
                'blood': 'A-',
                'parent_name': 'Sunil Das',
                'parent_phone': '+91 9977008866',
                'room': None,  # Intentionally unallocated for testing allocation workflow
                'bed': None
            }
        ]

        created_students = {}
        for s in students_data:
            stu_user = User.objects.create_user(
                username=s['username'],
                email=s['email'],
                password='studentpassword123',
                first_name=s['name'][0],
                last_name=s['name'][1],
                role='STUDENT',
                phone=s['phone']
            )
            StudentProfile.objects.create(
                user=stu_user,
                student_id=s['student_id'],
                department=s['dept'],
                course=s['course'],
                year_of_study=s['year'],
                gender=s['gender'],
                blood_group=s['blood'],
                address='Flat 402, Green Avenue, Metro Sector 15',
                parent_name=s['parent_name'],
                parent_phone=s['parent_phone'],
                parent_relation='Father',
                emergency_contact=s['parent_phone']
            )
            if s['room']:
                RoomAllocation.objects.create(
                    student=stu_user,
                    room=s['room'],
                    bed_number=s['bed'],
                    academic_year='2026-2027',
                    status='ACTIVE',
                    notes='Allocated at the start of academic year'
                )
            created_students[s['username']] = stu_user

        self.stdout.write(f"Created {len(created_students)} Students and allocations.")

        # 4. Fees and Payments
        # Aarav - Fully Paid
        fee_aarav = Fee.objects.create(
            student=created_students['student.aarav'],
            academic_year='2026-2027',
            semester='Sem 1',
            fee_type='TOTAL',
            amount=40000.00,
            due_date=timezone.localdate() + datetime.timedelta(days=30),
            status='PAID'
        )
        Payment.objects.create(
            fee=fee_aarav,
            student=created_students['student.aarav'],
            amount=40000.00,
            payment_method='ONLINE',
            transaction_id='TXN-HMS-9928172635',
            receipt_number='REC-HMS-2026-001',
            status='SUCCESS',
            remarks='Paid semester fee online via Card'
        )

        # Rohan - Partially Paid
        fee_rohan = Fee.objects.create(
            student=created_students['student.rohan'],
            academic_year='2026-2027',
            semester='Sem 1',
            fee_type='TOTAL',
            amount=40000.00,
            due_date=timezone.localdate() + datetime.timedelta(days=15),
            status='PARTIAL'
        )
        Payment.objects.create(
            fee=fee_rohan,
            student=created_students['student.rohan'],
            amount=25000.00,
            payment_method='UPI',
            transaction_id='TXN-HMS-8877112233',
            receipt_number='REC-HMS-2026-002',
            status='SUCCESS',
            remarks='Partial payment of Rs. 25,000 via UPI'
        )

        # Kabir - Pending Payment (Ideal for testing live payment checkout!)
        Fee.objects.create(
            student=created_students['student.kabir'],
            academic_year='2026-2027',
            semester='Sem 1',
            fee_type='TOTAL',
            amount=35000.00,
            due_date=timezone.localdate() + datetime.timedelta(days=10),
            status='PENDING'
        )

        # Ananya - Paid
        fee_ananya = Fee.objects.create(
            student=created_students['student.ananya'],
            academic_year='2026-2027',
            semester='Sem 1',
            fee_type='TOTAL',
            amount=40000.00,
            due_date=timezone.localdate() + datetime.timedelta(days=20),
            status='PAID'
        )
        Payment.objects.create(
            fee=fee_ananya,
            student=created_students['student.ananya'],
            amount=40000.00,
            payment_method='ONLINE',
            transaction_id='TXN-HMS-7766554433',
            receipt_number='REC-HMS-2026-003',
            status='SUCCESS',
            remarks='Full fee payment via NetBanking'
        )

        # Priya - Pending
        Fee.objects.create(
            student=created_students['student.priya'],
            academic_year='2026-2027',
            semester='Sem 1',
            fee_type='TOTAL',
            amount=35000.00,
            due_date=timezone.localdate() + datetime.timedelta(days=12),
            status='PENDING'
        )

        self.stdout.write("Created Fees and Payment records.")

        # 5. Food Menu (7 Days of realistic varied meals)
        base_date = timezone.localdate()
        menu_items_cycle = [
            {
                'BREAKFAST': ('Idli Sambar, Medu Vada, Coconut Chutney, Bread & Jam, Coffee/Tea', '07:30 AM', '09:30 AM', 'Fresh Coconut Chutney'),
                'LUNCH': ('Dal Makhani, Jeera Rice, Paneer Butter Masala, Fresh Rotis, Boondi Raita, Salad', '12:30 PM', '02:30 PM', 'Paneer Butter Masala'),
                'SNACKS': ('Veg Samosa (2 pcs), Green Mint Chutney, Masala Chai, Biscuits', '05:00 PM', '06:30 PM', 'Hot Crispy Samosas'),
                'DINNER': ('Yellow Dal Tadka, Steamed Basmati Rice, Chapati, Aloo Gobhi Matar, Gulab Jamun (1 pc)', '07:45 PM', '09:45 PM', 'Gulab Jamun')
            },
            {
                'BREAKFAST': ('Aloo Paratha with White Butter, Curd, Mixed Pickle, Sprouts Salad, Hot Tea', '07:30 AM', '09:30 AM', 'Stuffed Aloo Paratha'),
                'LUNCH': ('Rajma Masala, Steamed Rice, Tandoori Roti, Bhindi Fry, Cucumber Raita, Papad', '12:30 PM', '02:30 PM', 'Delhi Style Rajma Chawal'),
                'SNACKS': ('Pav Bhaji with Butter Pav, Lemon Onion Salad, Filter Coffee', '05:00 PM', '06:30 PM', 'Special Pav Bhaji'),
                'DINNER': ('Chole Masala, Vegetable Pulao, Butter Naan, Mixed Veg Curry, Rasgulla (1 pc)', '07:45 PM', '09:45 PM', 'Bengali Rasgulla')
            },
            {
                'BREAKFAST': ('Poha with roasted peanuts and lemon, Boiled Eggs (optional), Bread Butter, Masala Chai', '07:30 AM', '09:30 AM', 'Indori Poha'),
                'LUNCH': ('Kadhi Pakoda, Steamed Rice, Phulkas, Baingan Bharta, Roasted Papad, Sweet Lassi', '12:30 PM', '02:30 PM', 'Punjabi Kadhi Pakoda'),
                'SNACKS': ('Mix Veg Pakora, Fried Green Chillies, Sweet & Sour Chutney, Ginger Tea', '05:00 PM', '06:30 PM', 'Crispy Pakoras'),
                'DINNER': ('Shahi Paneer, Peas Pulao, Whole Wheat Rotis, Dal Fry, Moong Dal Halwa', '07:45 PM', '09:45 PM', 'Moong Dal Halwa')
            },
            {
                'BREAKFAST': ('Masala Dosa, Tomato Chutney, Sambar, Seasonal Cut Fruits, Coffee/Tea', '07:30 AM', '09:30 AM', 'Crispy Masala Dosa'),
                'LUNCH': ('Palak Paneer, Jeera Rice, Tawa Roti, Chana Dal, Onion Tomato Salad', '12:30 PM', '02:30 PM', 'Palak Paneer'),
                'SNACKS': ('Grilled Cheese Sandwich, Tomato Ketchup, Cardamom Tea', '05:00 PM', '06:30 PM', 'Grilled Sandwiches'),
                'DINNER': ('Dum Aloo Kashmiri, Vegetable Biryani, Mirchi Ka Salan, Raita, Kheer', '07:45 PM', '09:45 PM', 'Kashmiri Dum Aloo')
            },
            {
                'BREAKFAST': ('Uttapam with Sambar, Coconut Chutney, Boiled Eggs, Tea/Coffee', '07:30 AM', '09:30 AM', 'Onion Tomato Uttapam'),
                'LUNCH': ('Dal Tadka, Steamed Rice, Chapati, Lauki Chana Dal, Green Salad', '12:30 PM', '02:30 PM', 'Homestyle Thali'),
                'SNACKS': ('Bread Pakora, Mint Sauce, Hot Tea', '05:00 PM', '06:30 PM', 'Hot Bread Pakora'),
                'DINNER': ('Matar Mushroom Curry, Jeera Rice, Rotis, Dal Makhani, Fruit Custard', '07:45 PM', '09:45 PM', 'Chilled Fruit Custard')
            },
            {
                'BREAKFAST': ('Chole Bhature with Pickled Onions, Sweet Lassi, Tea', '07:30 AM', '09:30 AM', 'Fluffy Chole Bhature'),
                'LUNCH': ('Mix Veg Kolhapuri, Dal Tadka, Steamed Rice, Chapati, Boondi Raita', '12:30 PM', '02:30 PM', 'Kolhapuri Gravy'),
                'SNACKS': ('Dhokla with Mustard Tempering, Green Chutney, Masala Chai', '05:00 PM', '06:30 PM', 'Gujarati Dhokla'),
                'DINNER': ('Special Sunday Feast: Paneer Tikka Masala, Veg Biryani, Rumali Roti, Ice Cream', '07:45 PM', '09:45 PM', 'Special Ice Cream Feast')
            },
            {
                'BREAKFAST': ('Upma with Podi and Ghee, Sambar, Coconut Chutney, Banana, Tea/Coffee', '07:30 AM', '09:30 AM', 'Rava Upma'),
                'LUNCH': ('Sambar, Rasam, Steamed Rice, Potato Fry, Curd Rice, Appalam', '12:30 PM', '02:30 PM', 'South Indian Meals'),
                'SNACKS': ('Bhel Puri with tangy tamarind chutney, Sev, Green Tea / Chai', '05:00 PM', '06:30 PM', 'Mumbai Bhel Puri'),
                'DINNER': ('Methi Malai Matar, Jeera Rice, Roti, Dal Fry, Gajar Ka Halwa', '07:45 PM', '09:45 PM', 'Warm Gajar Ka Halwa')
            }
        ]

        # Generate menu for past 1 day + today + next 5 days
        for offset in range(-1, 6):
            menu_date = base_date + datetime.timedelta(days=offset)
            cycle_idx = (menu_date.toordinal()) % len(menu_items_cycle)
            items_pack = menu_items_cycle[cycle_idx]

            menu_obj = FoodMenu.objects.create(
                date=menu_date,
                is_published=True,
                special_notes='Prepared fresh in the hostel central mess with hygiene inspection' if offset >= 0 else 'Completed',
                created_by=admin_user
            )

            for meal_type, (items, st, et, special) in items_pack.items():
                FoodMenuItem.objects.create(
                    menu=menu_obj,
                    meal_type=meal_type,
                    items=items,
                    start_time=st,
                    end_time=et,
                    special_item=special
                )

        self.stdout.write("Created 7-day Food Menus with 4 meals each.")

        # 6. Complaints Workflow
        c1 = Complaint.objects.create(
            student=created_students['student.aarav'],
            category='ELECTRICAL',
            title='Ceiling fan making rattling noise in Room A-101',
            description='The ceiling fan speed regulator is loose and at speed 4 it starts vibrating violently.',
            priority='MEDIUM',
            status='IN_PROGRESS',
            assigned_to=warden1,
            resolution_notes='Electrician Ramu assigned to inspect bearing and regulator on Tuesday morning.'
        )
        ComplaintAssignment.objects.create(
            complaint=c1,
            assigned_to=warden1,
            assigned_by=admin_user,
            notes='Assigned to Warden Sharma for immediate electrical technician inspection.',
            status='IN_PROGRESS'
        )

        c2 = Complaint.objects.create(
            student=created_students['student.rohan'],
            category='INTERNET',
            title='Wi-Fi Access Point unreachable on 1st Floor North Wing',
            description='The hostel AP "KIC-WIFI-A1" frequently drops connection during evening hours (8 PM - 11 PM).',
            priority='HIGH',
            status='ASSIGNED',
            assigned_to=warden1,
            resolution_notes='IT network admin notified to replace faulty RJ45 patch cable.'
        )
        ComplaintAssignment.objects.create(
            complaint=c2,
            assigned_to=warden1,
            assigned_by=admin_user,
            notes='Forwarded to campus network team.',
            status='ASSIGNED'
        )

        c3 = Complaint.objects.create(
            student=created_students['student.ananya'],
            category='PLUMBING',
            title='Washroom basin pipe leakage in Room B-201',
            description='The drainage pipe under the washbasin has a tiny crack causing water accumulation on floor.',
            priority='HIGH',
            status='RESOLVED',
            assigned_to=warden2,
            resolution_notes='Plumber Mohan replaced the PVC flexible pipe with a new brass coupling. Fixed and tested.'
        )
        ComplaintAssignment.objects.create(
            complaint=c3,
            assigned_to=warden2,
            assigned_by=admin_user,
            notes='Resolved by Warden Patel and maintenance team.',
            status='RESOLVED'
        )

        c4 = Complaint.objects.create(
            student=created_students['student.kabir'],
            category='ROOM_MAINTENANCE',
            title='Study table drawer lock jammed in Room A-102',
            description='The key turns halfway but the drawer slide does not open.',
            priority='LOW',
            status='SUBMITTED'
        )

        c5 = Complaint.objects.create(
            student=created_students['student.priya'],
            category='FOOD_QUALITY',
            title='Request for more green salad and curd during lunch',
            description='During peak summer, it would be very helpful if the mess serves cold curd and fresh cucumber salad daily.',
            priority='MEDIUM',
            status='UNDER_REVIEW',
            assigned_to=warden2,
            resolution_notes='Discussed with Mess Contractor. Will be added to the daily standard layout.'
        )

        self.stdout.write("Created Complaints and Lifecycle Records.")

        # 7. Attendance
        for offset in range(-2, 1):
            att_date = base_date + datetime.timedelta(days=offset)
            for s_user in created_students.values():
                status_choice = 'PRESENT'
                remarks = 'Present at evening roll call'
                if s_user.username == 'student.priya' and offset == -1:
                    status_choice = 'ON_LEAVE'
                    remarks = 'Approved weekend gate pass leave'
                elif s_user.username == 'student.rohan' and offset == -2:
                    status_choice = 'ABSENT'
                    remarks = 'Unexcused absence during night roll call'

                Attendance.objects.create(
                    student=s_user,
                    date=att_date,
                    status=status_choice,
                    marked_by=warden1,
                    remarks=remarks
                )

        self.stdout.write("Created Student Attendance Records.")

        # 8. Visitors
        Visitor.objects.create(
            visitor_name='Sanjay Mehta',
            visitor_phone='+91 9911002200',
            visitor_id_proof='Aadhaar Card: **** 4821',
            student=created_students['student.aarav'],
            purpose='Parent visit to deliver study books and laptop',
            status='EXITED',
            exit_time=timezone.now() - datetime.timedelta(hours=2),
            registered_by=sec1,
            remarks='Verified parent identity with student profile'
        )

        Visitor.objects.create(
            visitor_name='Manoj Gupta',
            visitor_phone='+91 9922003311',
            visitor_id_proof='Driving License: DL-04-2018-9921',
            student=created_students['student.rohan'],
            purpose='Family visit during visiting hours',
            status='INSIDE',
            registered_by=sec1,
            remarks='Issued visitor pass #VP-108. Currently in common room.'
        )

        Visitor.objects.create(
            visitor_name='Meenakshi Iyer',
            visitor_phone='+91 9933004488',
            visitor_id_proof='Voter ID: VTR-29182',
            student=created_students['student.ananya'],
            purpose='Mother visiting with home food',
            status='INSIDE',
            registered_by=sec1,
            remarks='Issued visitor pass #VP-109. Verified.'
        )

        self.stdout.write("Created Visitors log.")

        # 9. Notices
        Notice.objects.create(
            title='Hostel Annual Cultural Festival "Tarang 2026" Announcements',
            content='We are thrilled to announce that the Annual Hostel Cultural Night & Sports Tournament will be held from Dec 12-14. Registrations for cultural performances, chess, table tennis, and badminton are open now at the Warden office.',
            target_role='ALL',
            priority='HIGH',
            is_published=True,
            published_by=admin_user
        )

        Notice.objects.create(
            title='Mandatory Hostel Room Cleanliness & Safety Inspection',
            content='All residents are notified that routine cleanliness and electrical safety inspections will be conducted across Blocks A and B this Saturday from 10:00 AM to 1:00 PM. Please ensure rooms are tidy and high-wattage heating coils are not kept.',
            target_role='STUDENT',
            priority='NORMAL',
            is_published=True,
            published_by=warden1
        )

        Notice.objects.create(
            title='Hostel Gate Curfew & Night Entry Policy',
            content='All hostel students are strictly reminded that the main campus hostel gates close at 09:30 PM. Late entry requires prior approval of the hostel warden via an authorized gate pass.',
            target_role='ALL',
            priority='URGENT',
            is_published=True,
            published_by=admin_user
        )

        Notice.objects.create(
            title='Security Staff Briefing: Visitor Pass & Vehicle Registration Protocol',
            content='All security personnel on Gate 1 and Gate 2 are instructed to verify government photo ID proofs of all external visitors before issuing visitor entry passes and logging them in the HMS portal.',
            target_role='SECURITY',
            priority='HIGH',
            is_published=True,
            published_by=admin_user
        )

        self.stdout.write(self.style.SUCCESS("Database successfully seeded with realistic HMS demonstration data!"))
