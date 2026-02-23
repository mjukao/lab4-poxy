// Script to add student data to database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addStudent() {
  try {
    console.log('🔄 กำลังเชื่อมต่อฐานข้อมูล...');
    
    // เพิ่มข้อมูลนักศึกษา
    const student = await prisma.task.create({
      data: {
        title: 'ภาคิน อินแถลง',
        description: '6604101365'
      }
    });

    console.log('✅ เพิ่มข้อมูลสำเร็จ!');
    console.log('📝 ข้อมูลที่เพิ่ม:', student);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addStudent();
