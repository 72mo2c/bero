// ======================================
// New Sales Invoice - فاتورة مبيعات جديدة (مُحسَّن ومضغوط)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaSave, FaPrint, FaSearch, FaTrash } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const NewSalesInvoice = () => {
  const { customers, products, warehouses, addSalesInvoice } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentType: 'main',
    agentType: 'main',
    notes: ''
  });

  const [items, setItems] = useState([{
    productId: '',
    productName: '',
    mainQuantity: 0,
    subQuantity: 0,
    mainPrice: 0,
    subPrice: 0
  }]);

  // البحث في العملاء والمنتجات
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [productSearches, setProductSearches] = useState(['']);
  const [showProductSuggestions, setShowProductSuggestions] = useState([false]);
  
  // حالات الخطأ
  const [customerError, setCustomerError] = useState(false);
  const [productErrors, setProductErrors] = useState([false]);
  const [quantityErrors, setQuantityErrors] = useState([false]);
  const [priceErrors, setPriceErrors] = useState([false]);
  const [validationErrors, setValidationErrors] = useState({});

  // مراجع للتركيز التلقائي
  const customerInputRef = useRef(null);
  const productInputRefs = useRef([]);
  const quantityInputRefs = useRef([]);

  // التركيز التلقائي عند التحميل
  useEffect(() => {
    customerInputRef.current?.focus();
  }, []);

  // معالجة اختصارات الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
      if (e.key === 'Enter' && e.target.name?.startsWith('mainQuantity-')) {
        const index = parseInt(e.target.name.split('-')[1]);
        if (index === items.length - 1) {
          e.preventDefault();
          addItem();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // البحث في العملاء
  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    setShowCustomerSuggestions(value.trim().length > 0);
  };

  const selectCustomer = (customer) => {
    setFormData({ ...formData, customerId: customer.id });
    setCustomerSearch(customer.name);
    setShowCustomerSuggestions(false);
  };
  
  const handleCustomerBlur = () => {
    setTimeout(() => {
      setShowCustomerSuggestions(false);
    }, 200);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // البحث في المنتجات
  const handleProductSearch = (index, value) => {
    const newSearches = [...productSearches];
    newSearches[index] = value;
    setProductSearches(newSearches);

    const newShowSuggestions = [...showProductSuggestions];
    newShowSuggestions[index] = value.trim().length > 0;
    setShowProductSuggestions(newShowSuggestions);
  };

  const selectProduct = (index, product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      mainPrice: parseFloat(product.mainPrice) || 0,
      subPrice: parseFloat(product.subPrice) || 0
    };
    setItems(newItems);

    const newSearches = [...productSearches];
    newSearches[index] = product.name;
    setProductSearches(newSearches);

    const newShowSuggestions = [...showProductSuggestions];
    newShowSuggestions[index] = false;
    setShowProductSuggestions(newShowSuggestions);

    setTimeout(() => {
      quantityInputRefs.current[index]?.focus();
    }, 100);
  };
  
  const handleProductBlur = (index) => {
    setTimeout(() => {
      const newShowSuggestions = [...showProductSuggestions];
      newShowSuggestions[index] = false;
      setShowProductSuggestions(newShowSuggestions);
    }, 200);
  };

  const getFilteredProducts = (index) => {
    const searchTerm = productSearches[index] || '';
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    
    if (field === 'mainQuantity' || field === 'subQuantity') {
      const newQuantityErrors = [...quantityErrors];
      if (field === 'mainQuantity') {
        newQuantityErrors[index] = value < 0;
      }
      setQuantityErrors(newQuantityErrors);
    }
    
    if (field === 'mainPrice' || field === 'subPrice') {
      const newPriceErrors = [...priceErrors];
      if (field === 'mainPrice') {
        newPriceErrors[index] = value < 0;
      }
      setPriceErrors(newPriceErrors);
    }
  };

  const addItem = () => {
    setItems([...items, { 
      productId: '', 
      productName: '',
      mainQuantity: 0, 
      subQuantity: 0,
      mainPrice: 0,
      subPrice: 0
    }]);
    setProductSearches([...productSearches, '']);
    setShowProductSuggestions([...showProductSuggestions, false]);
    setProductErrors([...productErrors, false]);
    setQuantityErrors([...quantityErrors, false]);
    setPriceErrors([...priceErrors, false]);

    setTimeout(() => {
      const lastIndex = items.length;
      productInputRefs.current[lastIndex]?.focus();
    }, 100);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setProductSearches(productSearches.filter((_, i) => i !== index));
      setShowProductSuggestions(showProductSuggestions.filter((_, i) => i !== index));
      setProductErrors(productErrors.filter((_, i) => i !== index));
      setQuantityErrors(quantityErrors.filter((_, i) => i !== index));
      setPriceErrors(priceErrors.filter((_, i) => i !== index));
    }
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
        <div className="mt-1 p-1 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
          ⚠️ المطلوب ({requestedQty}) > المتاح ({availableQty})
        </div>
      );
    }
    
    if (availableQty - requestedQty < 5 && availableQty - requestedQty > 0) {
      return (
        <div className="mt-1 p-1 bg-yellow-50 border border-yellow-200 rounded text-yellow-600 text-xs">
          ⚡ المتبقي: {availableQty - requestedQty}
        </div>
      );
    }
    
    return null;
  };

  const calculateItemTotal = (item) => {
    const mainTotal = (item.mainQuantity || 0) * (item.mainPrice || 0);
    const subTotal = (item.subQuantity || 0) * (item.subPrice || 0);
    return mainTotal + subTotal;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  // التحقق الشامل من البيانات
  const validateForm = () => {
    const errors = {};
    
    if (!formData.customerId) {
      errors.customer = 'يجب اختيار العميل';
    }
    
    if (!formData.date) {
      errors.date = 'يجب إدخال تاريخ الفاتورة';
    }
    
    const newQuantityErrors = [];
    const newPriceErrors = [];
    
    items.forEach((item, index) => {
      if (!item.productId) {
        errors[`product_${index}`] = 'يجب اختيار المنتج';
      }
      
      if (item.mainQuantity < 0) {
        errors[`mainQuantity_${index}`] = 'الكمية الأساسية لا يمكن أن تكون سالبة';
        newQuantityErrors[index] = true;
      } else if (item.mainQuantity === 0 && item.subQuantity === 0) {
        errors[`quantity_${index}`] = 'يجب إدخال كمية أساسية أو فرعية';
        newQuantityErrors[index] = true;
      } else {
        newQuantityErrors[index] = false;
      }
      
      if (item.mainPrice < 0) {
        errors[`mainPrice_${index}`] = 'السعر الأساسي لا يمكن أن يكون سالباً';
        newPriceErrors[index] = true;
      } else if (item.mainPrice === 0 && item.mainQuantity > 0) {
        errors[`mainPrice_${index}`] = 'يجب إدخال سعر أساسي للمنتج';
        newPriceErrors[index] = true;
      } else {
        newPriceErrors[index] = false;
      }
      
      if (item.subPrice < 0) {
        errors[`subPrice_${index}`] = 'السعر الفرعي لا يمكن أن يكون سالباً';
      } else if (item.subPrice === 0 && item.subQuantity > 0) {
        errors[`subPrice_${index}`] = 'يجب إدخال سعر فرعي عند وجود كمية فرعية';
      }

      const product = products.find(p => p.id === parseInt(item.productId));
      if (product) {
        const totalRequested = (item.mainQuantity || 0) + (item.subQuantity || 0);
        const totalAvailable = product.mainQuantity || 0;
        
        if (totalRequested > totalAvailable) {
          errors[`stock_${index}`] = `الكمية المطلوبة غير متوفرة. المتوفر: ${totalAvailable}`;
        }
      }
    });
    
    setQuantityErrors(newQuantityErrors);
    setPriceErrors(newPriceErrors);
    setValidationErrors(errors);
    
    const total = calculateTotal();
    if (total <= 0) {
      errors.total = 'المجموع الكلي يجب أن يكون أكبر من صفر';
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e, shouldPrint = false) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء قبل حفظ الفاتورة');
      
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        setTimeout(() => showError(firstError), 500);
      }
      return;
    }

    try {
      const convertedItems = items.map(item => ({
        productId: item.productId,
        quantity: (item.mainQuantity || 0) + (item.subQuantity || 0),
        price: item.mainQuantity > 0 ? item.mainPrice : item.subPrice
      }));

      const invoiceData = {
        ...formData,
        date: `${formData.date}T${formData.time}:00`,
        items: convertedItems,
        total: calculateTotal(),
        status: 'completed'
      };

      const newInvoice = addSalesInvoice(invoiceData);
      showSuccess(`تم حفظ فاتورة المبيعات بنجاح! الإجمالي: ${calculateTotal().toFixed(2)} د.ع`);

      if (shouldPrint) {
        const customer = customers.find(c => c.id === parseInt(formData.customerId));
        printInvoiceDirectly({
          formData: newInvoice,
          items: newInvoice.items,
          total: newInvoice.total,
          customer,
          customers,
          products,
          warehouses
        }, 'sales');
      }

      resetForm();
    } catch (error) {
      showError(error.message || 'حدث خطأ في حفظ الفاتورة');
      console.error('خطأ في حفظ فاتورة المبيعات:', error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentType: 'main',
      agentType: 'main',
      notes: ''
    });
    setItems([{ 
      productId: '', 
      productName: '',
      mainQuantity: 0, 
      subQuantity: 0,
      mainPrice: 0,
      subPrice: 0
    }]);
    setCustomerSearch('');
    setProductSearches(['']);
    setShowCustomerSuggestions(false);
    setShowProductSuggestions([false]);
    setCustomerError(false);
    setProductErrors([false]);
    setQuantityErrors([false]);
    setPriceErrors([false]);
    setValidationErrors({});
    customerInputRef.current?.focus();
  };

  return (
    <div className="max-w-6xl mx-auto p-3">
      {/* البطاقة الرئيسية */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* الصف العلوي: معلومات الفاتورة */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 border-b">
          {/* العميل */}
          <div className="relative">
            <div className="relative">
              <input
                ref={customerInputRef}
                type="text"
                value={customerSearch}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                onBlur={handleCustomerBlur}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="ابحث عن العميل..."
              />
              <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-xs" />
            </div>
            {showCustomerSuggestions && customerSearch.trim().length > 0 && filteredCustomers.length > 0 && (
              <div className="absolute z-[9999] w-full mt-1 bg-white border border-blue-300 rounded shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{customer.name}</span>
                      <span className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded text-2xs">{customer.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* نوع الفاتورة */}
          <div>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="main">نوع الفاتورة</option>
              <option value="cash">نقدي</option>
              <option value="deferred">آجل</option>
              <option value="partial">جزئي</option>
            </select>
          </div>

          {/* الوكيل */}
          <div>
            <select
              name="agentType"
              value={formData.agentType}
              onChange={handleChange}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="main">الوكيل</option>
              <option value="none">بدون</option>
              <option value="invoice">فاتورة</option>
              <option value="carton">كرتونة</option>
            </select>
          </div>

          {/* التاريخ والوقت */}
          <div className="grid grid-cols-2 gap-1">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* جدول المنتجات */}
        <div className="relative">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-2 py-1.5 text-right font-medium text-gray-700">المنتج</th>
                  <th className="px-1 py-1.5 text-center font-medium text-gray-700 w-16">كمية أساسية</th>
                  <th className="px-1 py-1.5 text-center font-medium text-gray-700 w-16">كمية فرعية</th>
                  <th className="px-1 py-1.5 text-center font-medium text-gray-700 w-20">سعر أساسي</th>
                  <th className="px-1 py-1.5 text-center font-medium text-gray-700 w-20">سعر فرعي</th>
                  <th className="px-1 py-1.5 text-center font-medium text-gray-700 w-20">الإجمالي</th>
                  <th className="px-1 py-1.5 text-center font-medium text-gray-700 w-12">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* المنتج */}
                    <td className="px-2 py-1.5 static">
                      <div className="relative z-[10]">
                        <input
                          ref={(el) => (productInputRefs.current[index] = el)}
                          type="text"
                          value={productSearches[index] || ''}
                          onChange={(e) => handleProductSearch(index, e.target.value)}
                          onBlur={() => handleProductBlur(index)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="ابحث عن المنتج..."
                        />
                        <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-2xs" />
                      </div>
                      {showProductSuggestions[index] && productSearches[index]?.trim().length > 0 && getFilteredProducts(index).length > 0 && (
                        <div className="absolute z-[9999] left-0 w-full mt-0.5 bg-white border border-blue-300 rounded shadow-lg max-h-48 overflow-y-auto">
                          {getFilteredProducts(index).map((product) => {
                            const warehouse = warehouses.find(w => w.id === product.warehouseId);
                            return (
                              <div
                                key={product.id}
                                onClick={() => selectProduct(index, product)}
                                className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors text-xs"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-800">{product.name}</span>
                                    <span className="text-gray-600 mr-1 text-2xs">({warehouse?.name || 'غير محدد'})</span>
                                  </div>
                                  <span className="font-medium text-green-700 bg-green-100 px-1 py-0.5 rounded text-2xs">المخزون: {product.mainQuantity || 0}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* رسالة تحذير المخزون */}
                      {getQuantityWarning(index)}
                    </td>

                    {/* الكمية الأساسية */}
                    <td className="px-1 py-1.5">
                      <input
                        ref={(el) => (quantityInputRefs.current[index] = el)}
                        type="number"
                        name={`mainQuantity-${index}`}
                        value={item.mainQuantity}
                        onChange={(e) => handleItemChange(index, 'mainQuantity', parseInt(e.target.value) || 0)}
                        className={`w-full px-1 py-1 text-xs text-center border rounded focus:ring-1 focus:ring-blue-500 ${
                          quantityErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        min="0"
                      />
                    </td>

                    {/* الكمية الفرعية */}
                    <td className="px-1 py-1.5">
                      <input
                        type="number"
                        value={item.subQuantity}
                        onChange={(e) => handleItemChange(index, 'subQuantity', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-1 text-xs text-center border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </td>

                    {/* السعر الأساسي */}
                    <td className="px-1 py-1.5">
                      <input
                        type="number"
                        step="0.01"
                        value={item.mainPrice}
                        onChange={(e) => handleItemChange(index, 'mainPrice', parseFloat(e.target.value) || 0)}
                        className={`w-full px-1 py-1 text-xs text-center border rounded focus:ring-1 focus:ring-blue-500 ${
                          priceErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        min="0"
                      />
                    </td>

                    {/* السعر الفرعي */}
                    <td className="px-1 py-1.5">
                      <input
                        type="number"
                        step="0.01"
                        value={item.subPrice}
                        onChange={(e) => handleItemChange(index, 'subPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-1 py-1 text-xs text-center border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </td>

                    {/* الإجمالي */}
                    <td className="px-1 py-1.5 text-center">
                      <span className="font-semibold text-blue-600 text-xs">
                        {calculateItemTotal(item).toFixed(2)}
                      </span>
                    </td>

                    {/* حذف */}
                    <td className="px-1 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed text-xs"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* زر إضافة منتج */}
        <button
          type="button"
          onClick={addItem}
          className="w-full py-1.5 border border-dashed border-gray-300 rounded text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-xs font-medium mx-3 my-2"
        >
          + إضافة منتج جديد (Enter)
        </button>

        {/* الجزء السفلي - مصفوفة من 3 أعمدة */}
        <div className="p-3 border-t bg-gray-50">
          <div className="grid grid-cols-3 gap-3 items-start">
            {/* العمود الأول: الملاحظات */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                placeholder="ملاحظات إضافية..."
              />
            </div>

            {/* العمود الثاني: الأزرار */}
            <div className="flex flex-col gap-1.5 justify-center items-center">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs transition-colors w-full justify-center"
              >
                <FaTrash className="text-xs" /> إعادة تعيين
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs transition-colors w-full justify-center"
              >
                <FaSave className="text-xs" /> حفظ
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs transition-colors w-full justify-center"
              >
                <FaPrint className="text-xs" /> حفظ وطباعة
              </button>
            </div>

            {/* العمود الثالث: المجموع */}
            <div className="flex flex-col justify-center">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded border border-blue-200 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">المجموع الكلي:</span>
                  <span className="text-lg font-bold text-blue-700">{calculateTotal().toFixed(2)} د.ع</span>
                </div>
                <div className="text-2xs text-gray-600 mt-1 text-right">
                  عدد المنتجات: {items.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* اختصارات الكيبورد */}
        <div className="px-3 py-2 border-t text-2xs text-gray-500 text-center bg-gray-50">
          <span className="inline-block mx-1">💡 اختصارات: </span>
          <span className="inline-block mx-1">Ctrl+S = حفظ</span>
          <span className="inline-block mx-1">Enter = صف جديد</span>
          <span className="inline-block mx-1">Tab = التنقل</span>
        </div>
      </div>
    </div>
  );
};

export default NewSalesInvoice;