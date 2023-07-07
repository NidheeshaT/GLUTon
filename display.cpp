#include "display.h"
void CodeSnippet::display(){
glClearColor(0.0, 0.0, 1.0, 1.0);
glClear(GL_COLOR_BUFFER_BIT);
glBegin(GL_POLYGON);
glColor3f(0.0, 1.0, 1.0);
glVertex2f(0.0, 0.0);
glVertex2f(0.0, 1.0);
glVertex2f(1.0, 0.0);
glEnd();
}