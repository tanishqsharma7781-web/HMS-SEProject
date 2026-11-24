import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Sparkles,
  Coffee,
  Sun,
  Sunset,
  Moon,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../../api/client';

export const StudentFoodMenuPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [menu, setMenu] = useState(null);
  const [upcomingMenus, setUpcomingMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu(selectedDate);
    fetchUpcoming();
  }, [selectedDate]);

  const fetchMenu = async (dateStr) => {
    setLoading(true);
    try {
      const res = await api.get(`/food-menu/?date=${dateStr}`);
      const list = res.data.results || res.data || [];
      if (list.length > 0) {
        setMenu(list[0]);
      } else {
        setMenu(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const res = await api.get('/food-menu/upcoming/');
      setUpcomingMenus(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const mealCards = [
    {
      type: 'BREAKFAST',
      title: 'Morning Breakfast',
      icon: Coffee,
      gradient: 'from-amber-500 to-amber-600',
      lightBg: 'bg-amber-50/70 border-amber-200',
      accentColor: 'text-amber-700',
      timingFallback: '07:30 AM - 09:30 AM',
    },
    {
      type: 'LUNCH',
      title: 'Midday Lunch',
      icon: Sun,
      gradient: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50/70 border-orange-200',
      accentColor: 'text-orange-700',
      timingFallback: '12:30 PM - 02:30 PM',
    },
    {
      type: 'SNACKS',
      title: 'Evening Snacks & Tea',
      icon: Sunset,
      gradient: 'from-rose-500 to-rose-600',
      lightBg: 'bg-rose-50/70 border-rose-200',
      accentColor: 'text-rose-700',
      timingFallback: '05:00 PM - 06:30 PM',
    },
    {
      type: 'DINNER',
      title: 'Night Dinner',
      icon: Moon,
      gradient: 'from-indigo-600 to-indigo-700',
      lightBg: 'bg-indigo-50/70 border-indigo-200',
      accentColor: 'text-indigo-700',
      timingFallback: '07:45 PM - 09:45 PM',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl p-6 text-white shadow-md">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/20">
          Campus Dining Services
        </span>
        <h2 className="text-2xl font-black mt-2">Daily Hostel Mess & Dining Menu</h2>
        <p className="text-xs text-amber-100 mt-1 max-w-xl leading-relaxed">
          Nutritious 4-meal daily menu freshly prepared under strict cleanliness standards. Check timings, special items, and upcoming scheduled menus.
        </p>
      </div>

      {/* Date Navigator Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Viewing Menu For</span>
            <div className="text-sm font-bold text-slate-800">
              {menu ? `${menu.date} (${menu.day_of_week})` : selectedDate}
            </div>
          </div>
        </div>

        {/* Quick Date Selectors */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
          >
            Yesterday
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
          >
            Tomorrow
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700"
          />
        </div>
      </div>

      {/* Dietary Note */}
      {menu?.special_notes && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center space-x-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{menu.special_notes}</span>
        </div>
      )}

      {/* 4 Dedicated Meal Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading mess dining menu...
        </div>
      ) : !menu ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No Published Menu for this Date</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The hostel warden or catering team has not yet published the menu for {selectedDate}. Please select another date or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealCards.map((card) => {
            const Icon = card.icon;
            const item = (menu.items || []).find((i) => i.meal_type === card.type);
            const itemsList = item?.items ? item.items.split(/,\s*|\n/).filter(Boolean) : [];

            return (
              <div
                key={card.type}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Header Banner */}
                <div className={`p-4 bg-gradient-to-r ${card.gradient} text-white flex items-center justify-between`}>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">{card.title}</h3>
                      <p className="text-[10px] text-white/80 font-medium">Daily Scheduled Meal</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold bg-black/15 px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item?.start_time ? `${item.start_time} - ${item.end_time}` : card.timingFallback}</span>
                  </div>
                </div>

                {/* Items Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Menu Items Served
                    </h5>
                    {itemsList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {itemsList.map((food, fIdx) => (
                          <span
                            key={fIdx}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${card.lightBg} ${card.accentColor}`}
                          >
                            {food.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        {item?.items || 'Standard hostel meal served'}
                      </p>
                    )}
                  </div>

                  {/* Special Dish Highlight */}
                  {item?.special_item && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-slate-700">Special Dish:</span>
                      </span>
                      <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {item.special_item}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming Menus Row */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Upcoming Scheduled Days
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {upcomingMenus.map((up) => (
            <button
              key={up.id}
              onClick={() => setSelectedDate(up.date)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                up.date === selectedDate
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <p className="text-[10px] font-medium opacity-80">{up.day_of_week}</p>
              <p className="text-xs font-bold mt-0.5">{up.date}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
