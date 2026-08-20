import { useEffect, useMemo, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import type { ItemInput } from '../types';

interface FormValues {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  imageUrl: string;
}

type FormField = keyof FormValues;
type FormErrors = Partial<Record<FormField, string>>;

const EMPTY_FORM: FormValues = {
  name: '',
  category: '',
  price: '',
  stock: '',
  description: '',
  imageUrl: '',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }
  if (!values.category.trim()) {
    errors.category = 'Category is required.';
  }
  if (values.price === '') {
    errors.price = 'Price is required.';
  } else if (Number.isNaN(Number(values.price)) || Number(values.price) < 0) {
    errors.price = 'Price must be a number of 0 or more.';
  }
  if (values.stock === '') {
    errors.stock = 'Stock is required.';
  } else if (!Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) {
    errors.stock = 'Stock must be a whole number of 0 or more.';
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required.';
  }
  if (values.imageUrl.trim()) {
    try {
      // eslint-disable-next-line no-new
      new URL(values.imageUrl.trim());
    } catch {
      errors.imageUrl = 'Image URL must be a valid URL.';
    }
  }

  return errors;
}

export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, error, reload, getItemById, addItem, updateItem } = useItems();

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const existingItem = isEdit && id ? getItemById(id) : undefined;

  // Populate the form when editing (once the item is available).
  useEffect(() => {
    if (isEdit && existingItem) {
      setValues({
        name: existingItem.name ?? '',
        category: existingItem.category ?? '',
        price: String(existingItem.price ?? ''),
        stock: String(existingItem.stock ?? ''),
        description: existingItem.description ?? '',
        imageUrl: existingItem.imageUrl ?? '',
      });
    }
  }, [isEdit, existingItem]);

  const liveErrors = useMemo(() => validate(values), [values]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: ItemInput = {
      name: values.name.trim(),
      category: values.category.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description.trim(),
      imageUrl: values.imageUrl.trim(),
    };

    if (isEdit && id) {
      updateItem(id, payload);
    } else {
      addItem(payload);
    }
    navigate('/items');
  };

  if (loading) return <Loader label="Loading form…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  if (isEdit && !existingItem) {
    return (
      <div className="state">
        <p className="state__text">Item not found.</p>
        <Link to="/items" className="btn btn--primary">
          Back to items
        </Link>
      </div>
    );
  }

  const showError = (field: FormField) =>
    (touched[field] || submitted) && (errors[field] || liveErrors[field]);

  return (
    <section>
      <Link to={isEdit ? `/items/${id}` : '/items'} className="back-link">
        ← Cancel
      </Link>

      <div className="form-card">
        <h1 className="form-card__title">{isEdit ? 'Edit item' : 'Create new item'}</h1>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__field">
            <label htmlFor="name" className="form__label">
              Name <span className="req">*</span>
            </label>
            <input
              id="name"
              name="name"
              className={`input${showError('name') ? ' input--error' : ''}`}
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Wireless Mouse"
            />
            {showError('name') && <p className="form__error">{errors.name || liveErrors.name}</p>}
          </div>

          <div className="form__row">
            <div className="form__field">
              <label htmlFor="category" className="form__label">
                Category <span className="req">*</span>
              </label>
              <input
                id="category"
                name="category"
                className={`input${showError('category') ? ' input--error' : ''}`}
                value={values.category}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Electronics"
              />
              {showError('category') && (
                <p className="form__error">{errors.category || liveErrors.category}</p>
              )}
            </div>

            <div className="form__field">
              <label htmlFor="price" className="form__label">
                Price (USD) <span className="req">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                className={`input${showError('price') ? ' input--error' : ''}`}
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
              />
              {showError('price') && (
                <p className="form__error">{errors.price || liveErrors.price}</p>
              )}
            </div>
          </div>

          <div className="form__field">
            <label htmlFor="stock" className="form__label">
              Stock <span className="req">*</span>
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              step="1"
              min="0"
              className={`input${showError('stock') ? ' input--error' : ''}`}
              value={values.stock}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0"
            />
            {showError('stock') && <p className="form__error">{errors.stock || liveErrors.stock}</p>}
          </div>

          <div className="form__field">
            <label htmlFor="imageUrl" className="form__label">
              Image URL
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              className={`input${showError('imageUrl') ? ' input--error' : ''}`}
              value={values.imageUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://…"
            />
            {showError('imageUrl') && (
              <p className="form__error">{errors.imageUrl || liveErrors.imageUrl}</p>
            )}
          </div>

          <div className="form__field">
            <label htmlFor="description" className="form__label">
              Description <span className="req">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className={`input${showError('description') ? ' input--error' : ''}`}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Short description of the item…"
            />
            {showError('description') && (
              <p className="form__error">{errors.description || liveErrors.description}</p>
            )}
          </div>

          <div className="form__actions">
            <Link to={isEdit ? `/items/${id}` : '/items'} className="btn btn--ghost">
              Cancel
            </Link>
            <button type="submit" className="btn btn--primary">
              {isEdit ? 'Save changes' : 'Create item'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
