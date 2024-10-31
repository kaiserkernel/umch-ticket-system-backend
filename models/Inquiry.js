const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    enrollmentNumber: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    firstYearOfStudy: {
      type: Number,
      required: true,
      min: 1900,
    },
    inquiryCategory: {
      type: String,
      required: true,
      enum: [
        'Applications and Requests',
        'Book rental UMCH library',
        'Campus IT',
        'Complaints',
        'Internship',
        'Medical Abilities',
        'Thesis',
        'Other',
      ],
    },
    subCategory1: {
      type: String,
      enum: [
        'Change of teaching hospital',
        'Change of study group',
        'Demonstrator student',
        'Enrollment',
        'Exam inspection',
        'Online Catalogue (Carnet)',
        'Recognition of Courses',
        'Recognition of Internship',
        'Short term borrow of Diploma',
        'Syllabus of the academic year',
        'Transcript of Records',
        'Transfer to Targu Mures',
        'Anatomy of The Trunk: The Thorax',
        'Bones Of The Human Body',
        'Limbs Anatomy',
        'Functional Anatomy Of The Abdominal Cavity',
        'Topographical Anatomy Of The Head And Neck',
        'Histology of the tissues',
        'Histology: practical works guide',
        'New Approaches In Behavioral Science',
        'Basic Concepts Of Pathology',
        'Compendium Of Systematic Pathology',
        "Barron's E-Z Anatomy and Physiology",
        'Cell and Molecular Biology',
        'Detailed Solutions to Physics Problems',
        'Biophysics Labora',
        'Canvas',
        'Streaming / Panopto',
        "Dean's Office",
        'German Teaching Department',
        'Teaching Hospital',
        'Teacher',
        'Online Catalogue (Carnet)',
        'Exam',
        'Other',
      ],
    },
    subCategory2: {
      type: String,
      enum: [
        'Administration Departments',
        'Campus Infrastructure (Furniture/Rooms etc)',
        'Finance',
      ],
    },
    details: {
      type: Object,
      required: true,
    },
    agreement: {
      type: Boolean,
      required: true,
    },
    status:{
      type:Number,
      enum:[0,1,2,3],
      default:0,
      required:true,
    },
    reason:{
      type: String
    },
    createdAt: { type: Date, default: Date.now },
  });
  
  const Inquiry = mongoose.model('Inquiry', inquirySchema);
module.exports = Inquiry;