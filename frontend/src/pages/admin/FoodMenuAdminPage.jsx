import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Sparkles,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Sun,
  Sunset,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../api/client';
import { Badge } from '../../components/common/Badge';

export const FoodMenuAdminPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [menu, setMenu] = useState(null);
  const [upcomingMenus, setUpcomingMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form State for the 4 meals of selected date
  const [menuForm, setMenuForm] = useState({
    is_published: true,
    special_notes: 'Prepared fresh under campus health hygiene standards',
    items: [
      { meal_type: 'BREAKFAST', items: '', start_time: '07:30 AM', end_time: '09:30 AM', special_item: '' },
      { meal_type: 'LUNCH', items: '', start_time: '12:30 PM', end_time: '02:30 PM', special_item: '' },
      { meal_type: 'SNACKS', items: '', start_time: '05:00 PM', end_time: '06:30 PM', special_item: '' },
      { meal_type: 'DINNER', items: '', start_time: '07:45 PM', end_time: '09:45 PM', special_item: '' },
    ]
  });

  useEffect(() => {
    fetchMenuForDate(selectedDate);
    fetchUpcoming();
  }, [selectedDate]);

  const fetchMenuForDate = async (dateStr) => {
    setLoading(true);
    try {
      const res = await api.get(`/food-menu/?date=${dateStr}`);
      const list = res.data.results || res.data || [];
      if (list.length > 0) {
        const found = list[0];
        setMenu(found);
        
        // Populate items
        const meals = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
        const itemsArr = meals.map((m) => {
          const itemMatch = (found.items || []).find((i) => i.meal_type === m);
          return {
            meal_type: m,
            items: itemMatch ? itemMatch.items : '',
            start_time: itemMatch?.start_time || getDefaultTiming(m)[0],
            end_time: itemMatch?.end_time || getDefaultTiming(m)[1],
            special_item: itemMatch?.special_item || '',
          };
        });

        setMenuForm({
          is_published: found.is_published,
          special_notes: found.special_notes || '',
          items: itemsArr,
        });
      } else {
        setMenu(null);
        // Default blank form
        setMenuForm({
          is_published: true,
          special_notes: 'Standard freshly prepared hostel meals',
          items: [
            { meal_type: 'BREAKFAST', items: 'Poha, Boiled Eggs / Banana, Bread Butter, Masala Chai', start_time: '07:30 AM', end_time: '09:30 AM', special_item: 'Fresh Poha' },
            { meal_type: 'LUNCH', items: 'Dal Fry, Steamed Rice, Seasonal Sabzi, Roti, Salad', start_time: '12:30 PM', end_time: '02:30 PM', special_item: 'Salad & Papad' },
            { meal_type: 'SNACKS', items: 'Crispy Veg Pakoras, Green Chutney, Hot Tea', start_time: '05:00 PM', end_time: '06:30 PM', special_item: 'Hot Pakoras' },
            { meal_type: 'DINNER', items: 'Paneer Butter Masala, Jeera Rice, Tawa Roti, Dal Tadka, Sweet', start_time: '07:45 PM', end_time: '09:45 PM', special_item: 'Gulab Jamun' },
          ]
        });
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

  const getDefaultTiming = (meal) => {
    switch (meal) {
      case 'BREAKFAST': return ['07:30 AM', '09:30 AM'];
      case 'LUNCH': return ['12:30 PM', '02:30 PM'];
      case 'SNACKS': return ['05:00 PM', '06:30 PM'];
      case 'DINNER': return ['07:45 PM', '09:45 PM'];
      default: return ['08:00 AM', '10:00 AM'];
    }
  };

  const handleMealChange = (index, field, value) => {
    const updated = [...menuForm.items];
    updated[index][field] = value;
    setMenuForm({ ...menuForm, items: updated });
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        is_published: menuForm.is_published,
        special_notes: menuForm.special_notes,
        items: menuForm.items,
      };

      if (menu) {
        await api.put(`/food-menu/${menu.id}/`, payload);
        setAlertMsg({ type: 'success', text: `Food menu for ${selectedDate} updated successfully!` });
      } else {
        await api.post('/food-menu/', payload);
        setAlertMsg({ type: 'success', text: `Food menu for ${selectedDate} created and scheduled!` });
      }
      fetchMenuForDate(selectedDate);
      fetchUpcoming();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to save food menu.' });
    } finally {
      setSaving(false);
    }
  };

  const mealConfig = [
    { type: 'BREAKFAST', label: 'Breakfast', icon: Coffee, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { type: 'LUNCH', label: 'Lunch', icon: Sun, color: 'text-orange-500 bg-orange-50 border-orange-200' },
    { type: 'SNACKS', label: 'Evening Snacks', icon: Sunset, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { type: 'DINNER', label: 'Dinner', icon: Moon, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hostel Mess Food Menu Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Plan daily nutritious meals (Breakfast, Lunch, Snacks, Dinner), manage service timings and publish schedules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl shadow-xs cursor-pointer">
            <input
              type="checkbox"
              checked={menuForm.is_published}
              onChange={(e) => setMenuForm({ ...menuForm, is_published: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className={menuForm.is_published ? 'text-emerald-700' : 'text-slate-500'}>
              {menuForm.is_published ? 'Published to Students' : 'Draft / Unpublished'}
            </span>
          </label>
          <button
            onClick={handleSaveMenu}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            <span>{menu ? 'Update Menu' : 'Save & Schedule Menu'}</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Date Navigation Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Selected Menu Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block font-bold text-slate-800 text-sm border-0 border-b border-indigo-400 focus:ring-0 focus:border-indigo-600 px-0 py-0.5"
            />
          </div>
        </div>

        {/* Quick Date Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Yesterday
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* 4 Meal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuForm.items.map((mealItem, index) => {
          const conf = mealConfig.find((c) => c.type === mealItem.meal_type) || mealConfig[0];
          const Icon = conf.icon;
          return (
            <div key={mealItem.meal_type} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className={`p-4 border-b flex items-center justify-between ${conf.color}`}>
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-white shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{conf.label}</h3>
                    <p className="text-[11px] font-medium opacity-80">Meal #{index + 1}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={mealItem.start_time}
                    onChange={(e) => handleMealChange(index, 'start_time', e.target.value)}
                    className="w-20 px-1 py-0.5 rounded border border-slate-300 text-center bg-white"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    value={mealItem.end_time}
                    onChange={(e) => handleMealChange(index, 'end_time', e.target.value)}
                    className="w-20 px-1 py-0.5 rounded border border-slate-300 text-center bg-white"
                  />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Food & Menu Items (Comma Separated) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={mealItem.items}
                    onChange={(e) => handleMealChange(index, 'items', e.target.value)}
                    placeholder="e.g. Dal Makhani, Jeera Rice, Paneer Butter Masala, Rotis, Salad"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Special Dish / Highlight of the Meal</span>
                  </label>
                  <input
                    type="text"
                    value={mealItem.special_item}
                    onChange={(e) => handleMealChange(index, 'special_item', e.target.value)}
                    placeholder="e.g. Rasgulla, Special Paneer Tikka, Ice Cream"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Mess Instructions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Special Notes & Hygiene Dietary Advisory for Students
        </label>
        <input
          type="text"
          value={menuForm.special_notes}
          onChange={(e) => setMenuForm({ ...menuForm, special_notes: e.target.value })}
          placeholder="e.g. Vegetarian only. Special festive meal served today."
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
        />
      </div>

      {/* Upcoming Menus Carousel Preview */}
      <div className="bg-slate-100/70 p-5 rounded-2xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Upcoming Scheduled Menus
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {upcomingMenus.map((up) => (
            <button
              key={up.id}
              onClick={() => setSelectedDate(up.date)}
              className={`p-3 rounded-xl border text-left transition-all ${
                up.date === selectedDate
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="text-[11px] opacity-80 font-medium">{up.day_of_week}</div>
              <div className="text-sm font-bold">{up.date}</div>
              <div className="mt-2 text-[10px] truncate opacity-90">
                {up.items?.map((i) => i.special_item).filter(Boolean).join(' • ') || 'Standard meals'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
