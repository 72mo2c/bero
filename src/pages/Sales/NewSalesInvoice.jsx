// ======================================
// New Sales Invoice - فاتورة مبيعات جديدة (محسّنة)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import InvoicePrint from '../../components/Common/InvoicePrint';
import { FaTrash, FaPrint, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
const NewSalesInvoice = () => {
  const { customers, products, warehouses, addSalesInvoice } = useData();
  const { showSuccess, showError } = useNotification();
  
  // مراجع للحقول
  const customerInputRef = useRef(null);
  const productInputRefs = useRef([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentType: 'cash',
    agentType: 'none',
    notes: ''
  });

  const [items, setItems] = useState([{
    productName: '',
    productId: '',
    mainQuantity: 0,
    subQuantity: 0,
    mainPrice: 0,
    subPrice: 0
  }]);
  
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(-1);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // البحث عن العملاء
  const handleCustomerSearch = (value) => {
    setFormData({ ...formData, customerName: value, customerId: '' });
    
    if (value.trim()) {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setCustomerSuggestions(filtered);
      setShowCustomerSuggestions(true);
    } else {
      setCustomerSuggestions([]);
      setShowCustomerSuggestions(false);
    }
  };

  // اختيار عميل
  const selectCustomer = (customer) => {
    setFormData({ ...formData, customerName: customer.name, customerId: customer.id });
    setShowCustomerSuggestions(false);
  };

  // البحث عن المنتجات
  const handleProductSearch = (index, value) => {
    const newItems = [...items];
    newItems[index].productName = value;
    newItems[index].productId = '';
    setItems(newItems);
    
    if (value.trim()) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setProductSuggestions(filtered);
      setShowProductSuggestions(index);
    } else {
      setProductSuggestions([]);
      setShowProductSuggestions(-1);
    }
  };

  // اختيار منتج
  const selectProduct = (index, product) => {
    const newItems = [...items];
    newItems[index] = {
      productName: product.name,
      productId: product.id,
      mainQuantity: 0,
      subQuantity: 0,
      mainPrice: parseFloat(product.mainPrice) || 0,
      subPrice: parseFloat(product.subPrice) || 0
    };
    setItems(newItems);
    setShowProductSuggestions(-1);
  };

  // تحديث حقل في المنتج
  const updateItemField = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // إضافة منتج جديد
  const addNewItem = () => {
    setItems([...items, {
      productName: '',
      productId: '',
      mainQuantity: 0,
      subQuantity: 0,
      mainPrice: 0,
      subPrice: 0
    }]);
  };

  // الحصول على المخزون المتاح للمنتج
  const getAvailableQuantity = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.mainQuantity || 0 : 0;
  };

  // عرض تحذير عن الكمية المطلوبة
  const getQuantityWarning = (index) => {
    const item = items[index];
    if (!item.productId) return null;
    
    const requestedQty = (item.mainQuantity || 0) + (item.subQuantity || 0);
    const availableQty = getAvailableQuantity(item.productId);
    
    if (requestedQty > availableQty) {
      return (
        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          ⚠️ الكمية المطلوبة ({requestedQty}) أكبر من المتاح ({availableQty})
        </div>
      );
    }
    
    if (availableQty - requestedQty < 5 && availableQty - requestedQty > 0) {
      return (
        <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
          ⚡ المخزون المتبقي: {availableQty - requestedQty}
        </div>
      );
    }
    
    return null;
  };

  // حذف منتج
  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // حساب إجمالي السطر
  const calculateLineTotal = (item) => {
    const mainTotal = (item.mainQuantity || 0) * (item.mainPrice || 0);
    const subTotal = (item.subQuantity || 0) * (item.subPrice || 0);
    return mainTotal + subTotal;
  };

  // حساب الإجمالي الكلي
  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  };

  // حفظ الفاتورة
  const handleSave = (shouldPrint = false) => {
    // التحقق من العميل
    if (!formData.customerId) {
      showError('يرجى اختيار عميل');
      return;
    }

    // التحقق من المنتجات
    const hasInvalidItems = items.some(item => 
      !item.productId || 
      (item.mainQuantity === 0 && item.subQuantity === 0)
    );
    
    if (hasInvalidItems) {
      showError('يرجى إدخال منتج وكمية واحدة على الأقل');
      return;
    }

    // التحقق من توفر المخزون
    for (let item of items) {
      const product = products.find(p => p.id === parseInt(item.productId));
      if (product) {
        const totalRequested = (item.mainQuantity || 0) + (item.subQuantity || 0);
        const totalAvailable = product.mainQuantity || 0;
        
        if (totalRequested > totalAvailable) {
          showError(`الكمية المطلوبة من "${product.name}" غير متوفرة.\nالمتوفر: ${totalAvailable}، المطلوب: ${totalRequested}`);
          return;
        }
      }
    }

    try {
      // تحويل البيانات للصيغة القديمة المتوافقة مع النظام
      const convertedItems = items.map(item => ({
        productId: item.productId,
        quantity: (item.mainQuantity || 0) + (item.subQuantity || 0),
        price: item.mainQuantity > 0 ? item.mainPrice : item.subPrice
      }));

      const invoiceData = {
        customerId: formData.customerId,
        date: `${formData.date}T${formData.time}:00`,
        paymentType: formData.paymentType,
        agentType: formData.agentType,
        notes: formData.notes,
        items: convertedItems,
        total: calculateGrandTotal(),
        status: 'completed'
      };

      addSalesInvoice(invoiceData);
      showSuccess(`تم حفظ فاتورة المبيعات بنجاح! الإجمالي: ${calculateGrandTotal().toFixed(2)} ج.م`);
      
      if (shouldPrint) {
        setShowPrintPreview(true);
      } else {
        resetForm();
      }
    } catch (error) {
      // عرض رسالة الخطأ الفعلية للمستخدم
      showError(error.message || 'حدث خطأ في حفظ الفاتورة');
      console.error('خطأ في حفظ الفاتورة:', error);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      customerName: '',
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentType: 'cash',
      agentType: 'none',
      notes: ''
    });
    setItems([{
      productName: '',
      productId: '',
      mainQuantity: 0,
      subQuantity: 0,
      mainPrice: 0,
      subPrice: 0
    }]);
  };

  // معالج Enter في حقل المنتج
  const handleProductKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewItem();
      setTimeout(() => {
        if (productInputRefs.current[index + 1]) {
          productInputRefs.current[index + 1].focus();
        }
      }, 100);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">

      {/* العنوان */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">فاتورة مبيعات جديدة</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <FaSave /> حفظ
          </button>
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <FaPrint /> حفظ وطباعة
          </button>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <FaTrash /> حذف الفاتورة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* معلومات الرأس */}
        <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 border-b">
          {/* العميل */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">العميل *</label>
            <input
              ref={customerInputRef}
              type="text"
              value={formData.customerName}
              onChange={(e) => handleCustomerSearch(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ابحث عن عميل..."
              autoComplete="off"
            />
            {showCustomerSuggestions && customerSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {customerSuggestions.map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    {customer.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* نوع الفاتورة */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">نوع الفاتورة *</label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cash">نقدي</option>
              <option value="deferred">آجل</option>
              <option value="partial">جزئي</option>
            </select>
          </div>

          {/* الوكيل */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">الوكيل *</label>
            <select
              value={formData.agentType}
              onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">بدون</option>
              <option value="invoice">فاتورة</option>
              <option value="carton">كرتونة</option>
            </select>
          </div>

          {/* التاريخ */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">التاريخ *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* الوقت */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">الوقت *</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* جدول المنتجات */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-3 py-2 text-right font-semibold text-gray-700" style={{ width: '25%' }}>المنتج</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700" style={{ width: '10%' }}>كمية أساسية</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700" style={{ width: '10%' }}>كمية فرعية</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700" style={{ width: '12%' }}>سعر أساسي</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700" style={{ width: '12%' }}>سعر فرعي</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700" style={{ width: '15%' }}>الإجمالي</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700" style={{ width: '6%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {/* اسم المنتج */}
                  <td className="px-3 py-2 relative">
                    <div className="relative z-[10]">
                    <input
                      ref={el => productInputRefs.current[index] = el}
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleProductSearch(index, e.target.value)}
                      onKeyDown={(e) => handleProductKeyDown(e, index)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ابحث عن منتج..."
                      autoComplete="off"
                    />
                    <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-xs" />
                    </div>
                    {showProductSuggestions === index && productSuggestions.length > 0 && (
                      <div className="absolute z-[9999] left-0 w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                        {productSuggestions.map(product => {
                          const warehouse = warehouses.find(w => w.id === product.warehouseId);
                          return (
                            <div
                              key={product.id}
                              onClick={() => selectProduct(index, product)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">
                                {warehouse?.name} - متوفر: {product.mainQuantity || 0}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </td>

                  {/* الكمية الأساسية */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.mainQuantity}
                      onChange={(e) => updateItemField(index, 'mainQuantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </td>

                  {/* الكمية الفرعية */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.subQuantity}
                      onChange={(e) => updateItemField(index, 'subQuantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                    {/* رسالة التحذير */}
                    {getQuantityWarning(index)}
                  </td>

                  {/* السعر الأساسي */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.mainPrice}
                      onChange={(e) => updateItemField(index, 'mainPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </td>

                  {/* السعر الفرعي */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.subPrice}
                      onChange={(e) => updateItemField(index, 'subPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </td>

                  {/* الإجمالي */}
                  <td className="px-3 py-2 text-center font-bold text-green-600">
                    {calculateLineTotal(item).toFixed(2)} د.ع
                  </td>

                  {/* حذف */}
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* زر إضافة منتج */}
        <div className="px-4 py-3 bg-gray-50 border-t">
          <button
            type="button"
            onClick={addNewItem}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + إضافة منتج جديد
          </button>
        </div>

        {/* المجاميع */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center max-w-md ml-auto">
            <div className="text-lg font-bold text-gray-800">الإجمالي الكلي:</div>
            <div className="text-2xl font-bold text-green-600">{calculateGrandTotal().toFixed(2)} د.ع</div>
          </div>
        </div>

        {/* ملاحظات */}
        <div className="p-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="2"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل ملاحظات إضافية..."
          />
        </div>
      </div>

      {/* معاينة الطباعة */}
      {showPrintPreview && (
        <InvoicePrint
          invoiceData={{
            formData: {
              customerId: formData.customerId,
              date: formData.date,
              paymentType: formData.paymentType,
              notes: formData.notes
            },
            items: items.map(item => ({
              productId: item.productId,
              quantity: (item.mainQuantity || 0) + (item.subQuantity || 0),
              price: item.mainQuantity > 0 ? item.mainPrice : item.subPrice
            })),
            total: calculateGrandTotal(),
            suppliers: [],
            customers,
            products,
            warehouses,
            paymentTypes: [
              { value: 'cash', label: 'نقدي' },
              { value: 'deferred', label: 'آجل' },
              { value: 'partial', label: 'جزئي' }
            ]
          }}
          type="sales"
          onClose={() => {
            setShowPrintPreview(false);
            resetForm();
          }}
        />
      )}
    </div>
  );
};

export default NewSalesInvoice;
